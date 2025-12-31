using System.Globalization;
using System.Text;
using System.Text.Json;
using ClosedXML.Excel;
using CsvHelper;
using CsvHelper.Configuration;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Domain.Entities;
using SurveyApp.Domain.Interfaces;

namespace SurveyApp.Infrastructure.Services;

/// <summary>
/// Service for exporting survey responses to various formats.
/// </summary>
public class ExportService(
    ISurveyRepository surveyRepository,
    ISurveyResponseRepository responseRepository,
    IDateTimeService dateTimeService
) : IExportService
{
    private readonly ISurveyRepository _surveyRepository = surveyRepository;
    private readonly ISurveyResponseRepository _responseRepository = responseRepository;
    private readonly IDateTimeService _dateTimeService = dateTimeService;

    /// <inheritdoc />
    public async Task<ExportResult> ExportToCsvAsync(
        ExportRequest request,
        CancellationToken cancellationToken = default
    )
    {
        var (survey, responses) = await GetExportDataAsync(request, cancellationToken);
        var exportData = PrepareExportData(survey, responses, request);

        using var memoryStream = new MemoryStream();
        using var writer = new StreamWriter(memoryStream, Encoding.UTF8);
        using var csv = new CsvWriter(
            writer,
            new CsvConfiguration(CultureInfo.InvariantCulture) { HasHeaderRecord = true }
        );

        // Write header
        foreach (var column in exportData.Columns)
        {
            csv.WriteField(column);
        }
        csv.NextRecord();

        // Write data rows
        foreach (var row in exportData.Rows)
        {
            foreach (var value in row)
            {
                csv.WriteField(value);
            }
            csv.NextRecord();
        }

        await writer.FlushAsync(cancellationToken);
        var data = memoryStream.ToArray();

        return new ExportResult
        {
            Data = data,
            FileName = GenerateFileName(survey.Title, "csv"),
            ContentType = "text/csv",
            TotalRows = exportData.Rows.Count,
        };
    }

    /// <inheritdoc />
    public async Task<ExportResult> ExportToExcelAsync(
        ExportRequest request,
        CancellationToken cancellationToken = default
    )
    {
        var (survey, responses) = await GetExportDataAsync(request, cancellationToken);
        var exportData = PrepareExportData(survey, responses, request);

        using var workbook = new XLWorkbook();
        var worksheet = workbook.Worksheets.Add("Responses");

        // Write headers
        for (int i = 0; i < exportData.Columns.Count; i++)
        {
            var cell = worksheet.Cell(1, i + 1);
            cell.Value = exportData.Columns[i];
            cell.Style.Font.Bold = true;
            cell.Style.Fill.BackgroundColor = XLColor.LightGray;
        }

        // Write data rows
        for (int rowIndex = 0; rowIndex < exportData.Rows.Count; rowIndex++)
        {
            var row = exportData.Rows[rowIndex];
            for (int colIndex = 0; colIndex < row.Count; colIndex++)
            {
                var cell = worksheet.Cell(rowIndex + 2, colIndex + 1);
                var value = row[colIndex];

                // Try to parse as specific types for better Excel formatting
                if (DateTime.TryParse(value, out var dateValue))
                {
                    cell.Value = dateValue;
                    cell.Style.DateFormat.Format = "yyyy-MM-dd HH:mm:ss";
                }
                else if (
                    decimal.TryParse(
                        value,
                        NumberStyles.Any,
                        CultureInfo.InvariantCulture,
                        out var numValue
                    )
                )
                {
                    cell.Value = numValue;
                }
                else
                {
                    cell.Value = value ?? string.Empty;
                }
            }
        }

        // Auto-fit columns
        worksheet.Columns().AdjustToContents();

        // Add summary worksheet
        var summarySheet = workbook.Worksheets.Add("Summary");
        summarySheet.Cell(1, 1).Value = "Survey Title";
        summarySheet.Cell(1, 2).Value = survey.Title;
        summarySheet.Cell(2, 1).Value = "Export Date";
        summarySheet.Cell(2, 2).Value = _dateTimeService.UtcNow;
        summarySheet.Cell(3, 1).Value = "Total Responses";
        summarySheet.Cell(3, 2).Value = exportData.Rows.Count;
        summarySheet.Cell(4, 1).Value = "Total Questions";
        summarySheet.Cell(4, 2).Value = survey.Questions.Count;

        summarySheet.Column(1).Style.Font.Bold = true;
        summarySheet.Columns().AdjustToContents();

        using var memoryStream = new MemoryStream();
        workbook.SaveAs(memoryStream);
        var data = memoryStream.ToArray();

        return new ExportResult
        {
            Data = data,
            FileName = GenerateFileName(survey.Title, "xlsx"),
            ContentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            TotalRows = exportData.Rows.Count,
        };
    }

    /// <inheritdoc />
    public async Task<ExportResult> ExportToJsonAsync(
        ExportRequest request,
        CancellationToken cancellationToken = default
    )
    {
        var (survey, responses) = await GetExportDataAsync(request, cancellationToken);

        var questionMap = survey.Questions.ToDictionary(q => q.Id, q => q);

        var jsonData = new
        {
            surveyId = survey.Id,
            surveyTitle = survey.Title,
            exportedAt = _dateTimeService.UtcNow,
            totalResponses = responses.Count,
            responses = responses
                .Select(r => new
                {
                    id = r.Id,
                    respondentEmail = r.RespondentEmail,
                    isComplete = r.IsComplete,
                    startedAt = r.StartedAt,
                    submittedAt = r.SubmittedAt,
                    answers = r
                        .Answers.Where(a =>
                            request.QuestionIds == null
                            || request.QuestionIds.Contains(a.QuestionId)
                        )
                        .Select(a => new
                        {
                            questionId = a.QuestionId,
                            questionText = questionMap.TryGetValue(a.QuestionId, out var q)
                                ? q.Text
                                : "Unknown",
                            questionType = questionMap.TryGetValue(a.QuestionId, out var qt)
                                ? qt.Type.ToString()
                                : "Unknown",
                            value = a.AnswerValue,
                            answeredAt = a.AnsweredAt,
                        })
                        .ToList(),
                })
                .ToList(),
        };

        var jsonOptions = new JsonSerializerOptions
        {
            WriteIndented = true,
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        };

        var jsonString = JsonSerializer.Serialize(jsonData, jsonOptions);
        var data = Encoding.UTF8.GetBytes(jsonString);

        return new ExportResult
        {
            Data = data,
            FileName = GenerateFileName(survey.Title, "json"),
            ContentType = "application/json",
            TotalRows = responses.Count,
        };
    }

    /// <inheritdoc />
    public async Task<ExportPreviewDto> GetExportPreviewAsync(
        Guid surveyId,
        CancellationToken cancellationToken = default
    )
    {
        var survey =
            await _surveyRepository.GetByIdWithQuestionsAsync(surveyId, cancellationToken)
            ?? throw new InvalidOperationException($"Survey with ID {surveyId} not found.");

        var totalResponses = await _responseRepository.GetCountBySurveyIdAsync(
            surveyId,
            false,
            cancellationToken
        );
        var completedResponses = await _responseRepository.GetCountBySurveyIdAsync(
            surveyId,
            true,
            cancellationToken
        );

        var columns = new List<ExportColumnDto>
        {
            new()
            {
                Id = "ResponseId",
                Name = "Response ID",
                Type = "Metadata",
                IsDefault = true,
            },
            new()
            {
                Id = "RespondentEmail",
                Name = "Respondent Email",
                Type = "Metadata",
                IsDefault = true,
            },
            new()
            {
                Id = "StartedAt",
                Name = "Started At",
                Type = "Metadata",
                IsDefault = true,
            },
            new()
            {
                Id = "SubmittedAt",
                Name = "Submitted At",
                Type = "Metadata",
                IsDefault = true,
            },
            new()
            {
                Id = "IsComplete",
                Name = "Is Complete",
                Type = "Metadata",
                IsDefault = true,
            },
        };

        foreach (var question in survey.Questions.OrderBy(q => q.Order))
        {
            columns.Add(
                new ExportColumnDto
                {
                    Id = question.Id.ToString(),
                    Name = question.Text,
                    Type = "Question",
                    IsDefault = true,
                }
            );
        }

        return new ExportPreviewDto
        {
            SurveyId = surveyId,
            SurveyTitle = survey.Title,
            TotalResponses = totalResponses,
            CompletedResponses = completedResponses,
            IncompleteResponses = totalResponses - completedResponses,
            Columns = columns,
        };
    }

    private async Task<(Survey Survey, IReadOnlyList<SurveyResponse> Responses)> GetExportDataAsync(
        ExportRequest request,
        CancellationToken cancellationToken
    )
    {
        var survey =
            await _surveyRepository.GetByIdWithQuestionsAsync(request.SurveyId, cancellationToken)
            ?? throw new InvalidOperationException($"Survey with ID {request.SurveyId} not found.");

        IReadOnlyList<SurveyResponse> responses;

        if (request.IncludeIncomplete)
        {
            responses = await _responseRepository.GetBySurveyIdAsync(
                request.SurveyId,
                cancellationToken
            );
        }
        else
        {
            responses = await _responseRepository.GetCompletedBySurveyIdAsync(
                request.SurveyId,
                cancellationToken
            );
        }

        // Apply filters
        if (request.Filter != null)
        {
            var filteredResponses = responses.AsEnumerable();

            if (request.Filter.DateRange?.StartDate.HasValue == true)
            {
                filteredResponses = filteredResponses.Where(r =>
                    r.StartedAt >= request.Filter.DateRange.StartDate
                );
            }

            if (request.Filter.DateRange?.EndDate.HasValue == true)
            {
                filteredResponses = filteredResponses.Where(r =>
                    r.StartedAt <= request.Filter.DateRange.EndDate
                );
            }

            if (!string.IsNullOrEmpty(request.Filter.RespondentEmail))
            {
                filteredResponses = filteredResponses.Where(r =>
                    r.RespondentEmail != null
                    && r.RespondentEmail.Contains(
                        request.Filter.RespondentEmail,
                        StringComparison.OrdinalIgnoreCase
                    )
                );
            }

            if (request.Filter.IsComplete.HasValue)
            {
                filteredResponses = filteredResponses.Where(r =>
                    r.IsComplete == request.Filter.IsComplete
                );
            }

            responses = [.. filteredResponses];
        }

        return (survey, responses);
    }

    private static ExportData PrepareExportData(
        Survey survey,
        IReadOnlyList<SurveyResponse> responses,
        ExportRequest request
    )
    {
        var columns = new List<string>
        {
            "Response ID",
            "Respondent Email",
            "Started At",
            "Submitted At",
            "Is Complete",
        };

        // Get questions to include
        var questions = survey
            .Questions.Where(q => request.QuestionIds == null || request.QuestionIds.Contains(q.Id))
            .OrderBy(q => q.Order)
            .ToList();

        foreach (var question in questions)
        {
            columns.Add(question.Text);
        }

        var rows = new List<List<string?>>();

        foreach (var response in responses)
        {
            var row = new List<string?>
            {
                response.Id.ToString(),
                response.RespondentEmail,
                FormatDateTime(response.StartedAt, request.TimezoneId),
                response.SubmittedAt.HasValue
                    ? FormatDateTime(response.SubmittedAt.Value, request.TimezoneId)
                    : null,
                response.IsComplete.ToString(),
            };

            // Add answer values for each question
            foreach (var question in questions)
            {
                var answer = response.Answers.FirstOrDefault(a => a.QuestionId == question.Id);
                row.Add(answer?.AnswerValue);
            }

            rows.Add(row);
        }

        return new ExportData { Columns = columns, Rows = rows };
    }

    private static string FormatDateTime(DateTime dateTime, string? timezoneId)
    {
        if (!string.IsNullOrEmpty(timezoneId))
        {
            try
            {
                var timeZone = TimeZoneInfo.FindSystemTimeZoneById(timezoneId);
                dateTime = TimeZoneInfo.ConvertTimeFromUtc(dateTime, timeZone);
            }
            catch (TimeZoneNotFoundException)
            {
                // Keep UTC if timezone not found
            }
        }

        return dateTime.ToString("yyyy-MM-dd HH:mm:ss");
    }

    private string GenerateFileName(string surveyTitle, string extension)
    {
        // Sanitize survey title for filename
        var safeName = string.Join("_", surveyTitle.Split(Path.GetInvalidFileNameChars()));
        if (safeName.Length > 50)
        {
            safeName = safeName[..50];
        }

        var timestamp = _dateTimeService.UtcNow.ToString("yyyyMMdd_HHmmss");
        return $"{safeName}_responses_{timestamp}.{extension}";
    }

    private class ExportData
    {
        public List<string> Columns { get; set; } = [];
        public List<List<string?>> Rows { get; set; } = [];
    }
}
