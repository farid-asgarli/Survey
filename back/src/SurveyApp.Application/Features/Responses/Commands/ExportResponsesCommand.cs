using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Domain.Interfaces;

namespace SurveyApp.Application.Features.Responses.Commands;

/// <summary>
/// Command to export survey responses.
/// </summary>
public record ExportResponsesCommand : IRequest<Result<ExportResult>>
{
    /// <summary>
    /// The survey ID to export responses from.
    /// </summary>
    public Guid SurveyId { get; init; }

    /// <summary>
    /// The export format (Csv, Excel, Json).
    /// </summary>
    public ExportFormat Format { get; init; }

    /// <summary>
    /// Optional filter for the export.
    /// </summary>
    public ExportFilter? Filter { get; init; }

    /// <summary>
    /// Specific question IDs to include (null = all questions).
    /// </summary>
    public List<Guid>? QuestionIds { get; init; }

    /// <summary>
    /// Whether to include metadata (IP, UserAgent, etc.).
    /// </summary>
    public bool IncludeMetadata { get; init; }

    /// <summary>
    /// Whether to include incomplete responses.
    /// </summary>
    public bool IncludeIncomplete { get; init; }

    /// <summary>
    /// Timezone ID for date formatting.
    /// </summary>
    public string? TimezoneId { get; init; }
}

/// <summary>
/// Handler for exporting survey responses.
/// </summary>
public class ExportResponsesCommandHandler(
    ISurveyRepository surveyRepository,
    IExportService exportService,
    INamespaceContext namespaceContext
) : IRequestHandler<ExportResponsesCommand, Result<ExportResult>>
{
    private readonly ISurveyRepository _surveyRepository = surveyRepository;
    private readonly IExportService _exportService = exportService;
    private readonly INamespaceContext _namespaceContext = namespaceContext;

    public async Task<Result<ExportResult>> Handle(
        ExportResponsesCommand request,
        CancellationToken cancellationToken
    )
    {
        // Verify survey exists and belongs to current namespace
        var survey = await _surveyRepository.GetByIdAsync(request.SurveyId, cancellationToken);

        if (survey == null)
        {
            return Result<ExportResult>.Failure("Errors.SurveyNotFound", "SURVEY_NOT_FOUND");
        }

        if (survey.NamespaceId != _namespaceContext.CurrentNamespaceId)
        {
            return Result<ExportResult>.Failure(
                "Survey not found in current namespace.",
                "SURVEY_NOT_FOUND"
            );
        }

        var exportRequest = new ExportRequest
        {
            SurveyId = request.SurveyId,
            Format = request.Format,
            Filter = request.Filter,
            QuestionIds = request.QuestionIds,
            IncludeMetadata = request.IncludeMetadata,
            IncludeIncomplete = request.IncludeIncomplete,
            TimezoneId = request.TimezoneId,
        };

        try
        {
            var result = request.Format switch
            {
                ExportFormat.Csv => await _exportService.ExportToCsvAsync(
                    exportRequest,
                    cancellationToken
                ),
                ExportFormat.Excel => await _exportService.ExportToExcelAsync(
                    exportRequest,
                    cancellationToken
                ),
                ExportFormat.Json => await _exportService.ExportToJsonAsync(
                    exportRequest,
                    cancellationToken
                ),
                _ => throw new ArgumentOutOfRangeException(
                    nameof(request.Format),
                    "Unsupported export format."
                ),
            };

            return Result<ExportResult>.Success(result);
        }
        catch (Exception ex)
        {
            return Result<ExportResult>.Failure($"Export failed: {ex.Message}", "EXPORT_FAILED");
        }
    }
}
