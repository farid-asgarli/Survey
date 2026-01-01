using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Domain.Common;
using SurveyApp.Domain.Entities;
using SurveyApp.Domain.Enums;
using SurveyApp.Domain.Interfaces;
using SurveyApp.Domain.ValueObjects;

namespace SurveyApp.Application.Features.Surveys.Queries.GetSurveyAnalytics;

public class GetSurveyAnalyticsQueryHandler(
    ISurveyRepository surveyRepository,
    ISurveyResponseRepository responseRepository,
    INamespaceRepository namespaceRepository,
    INamespaceContext namespaceContext,
    ICurrentUserService currentUserService
) : IRequestHandler<GetSurveyAnalyticsQuery, Result<SurveyAnalyticsDto>>
{
    private readonly ISurveyRepository _surveyRepository = surveyRepository;
    private readonly ISurveyResponseRepository _responseRepository = responseRepository;
    private readonly INamespaceRepository _namespaceRepository = namespaceRepository;
    private readonly INamespaceContext _namespaceContext = namespaceContext;
    private readonly ICurrentUserService _currentUserService = currentUserService;

    public async Task<Result<SurveyAnalyticsDto>> Handle(
        GetSurveyAnalyticsQuery request,
        CancellationToken cancellationToken
    )
    {
        var namespaceId = _namespaceContext.CurrentNamespaceId;
        if (!namespaceId.HasValue)
            return Result<SurveyAnalyticsDto>.Failure("Errors.NamespaceContextRequired");

        var survey = await _surveyRepository.GetByIdWithQuestionsAsync(
            request.SurveyId,
            cancellationToken
        );
        if (survey == null || survey.NamespaceId != namespaceId.Value)
            return Result<SurveyAnalyticsDto>.NotFound("Errors.SurveyNotFound");

        var userId = _currentUserService.UserId;
        if (!userId.HasValue)
            return Result<SurveyAnalyticsDto>.Unauthorized("Errors.UserNotAuthenticated");

        var @namespace = await _namespaceRepository.GetByIdAsync(
            namespaceId.Value,
            cancellationToken
        );
        var membership = @namespace?.Memberships.FirstOrDefault(m => m.UserId == userId.Value);
        if (membership == null || !membership.HasPermission(NamespacePermission.ViewResponses))
            return Result<SurveyAnalyticsDto>.Failure(
                "You do not have permission to view analytics."
            );

        var analyticsData = await _responseRepository.GetAnalyticsDataAsync(
            survey.Id,
            cancellationToken
        );

        var analytics = new SurveyAnalyticsDto
        {
            SurveyId = survey.Id,
            SurveyTitle = survey.Title,
            TotalResponses = analyticsData.TotalResponses,
            CompletedResponses = analyticsData.CompletedResponses,
            PartialResponses = analyticsData.PartialResponses,
            AverageCompletionTimeSeconds = analyticsData.AverageTimeSpentSeconds,
            CompletionRate =
                analyticsData.TotalResponses > 0
                    ? (decimal)analyticsData.CompletedResponses / analyticsData.TotalResponses * 100
                    : 0,
            FirstResponseAt = analyticsData.FirstResponseAt,
            LastResponseAt = analyticsData.LastResponseAt,
            ResponsesByDate = analyticsData.ResponsesByDate,
            Questions =
            [
                .. survey
                    .Questions.OrderBy(q => q.Order)
                    .Select(q =>
                        BuildQuestionAnalytics(
                            q,
                            analyticsData.AnswersByQuestion.GetValueOrDefault(q.Id, [])
                        )
                    ),
            ],
        };

        return Result<SurveyAnalyticsDto>.Success(analytics);
    }

    private static QuestionAnalyticsDto BuildQuestionAnalytics(
        Question question,
        List<string> rawAnswers
    )
    {
        var settings = question.GetSettings();
        var analytics = new QuestionAnalyticsDto
        {
            QuestionId = question.Id,
            QuestionText = question.Text,
            QuestionType = question.Type.ToString(),
            TotalAnswers = rawAnswers.Count,
            AnswerOptions = [],
        };

        switch (question.Type)
        {
            case QuestionType.SingleChoice:
            case QuestionType.MultipleChoice:
            case QuestionType.Dropdown:
            case QuestionType.Checkbox:
            case QuestionType.YesNo:
                BuildChoiceAnalytics(analytics, settings, rawAnswers);
                break;

            case QuestionType.Ranking:
                BuildRankingAnalytics(analytics, settings, rawAnswers);
                break;

            case QuestionType.Rating:
            case QuestionType.Scale:
            case QuestionType.NPS:
                BuildNumericAnalytics(analytics, settings, rawAnswers);
                break;

            case QuestionType.Text:
            case QuestionType.ShortText:
            case QuestionType.LongText:
            case QuestionType.Email:
            case QuestionType.Phone:
            case QuestionType.Url:
                BuildTextAnalytics(analytics, rawAnswers);
                break;

            case QuestionType.Number:
                BuildNumberAnalytics(analytics, rawAnswers);
                break;

            case QuestionType.Matrix:
                BuildMatrixAnalytics(analytics, rawAnswers);
                break;

            case QuestionType.Date:
            case QuestionType.DateTime:
                BuildDateAnalytics(analytics, rawAnswers);
                break;

            case QuestionType.FileUpload:
                BuildFileUploadAnalytics(analytics, rawAnswers);
                break;
        }

        return analytics;
    }

    private static void BuildChoiceAnalytics(
        QuestionAnalyticsDto analytics,
        QuestionSettings? settings,
        List<string> rawAnswers
    )
    {
        if (settings?.Options == null || settings.Options.Count == 0)
            return;

        // Parse all answers to get option IDs
        var parsedAnswers = rawAnswers.Select(AnswerValue.FromJson).ToList();

        // Count by option ID (stable aggregation!)
        var optionCounts = new Dictionary<Guid, int>();
        var otherTexts = new List<string>();

        foreach (var answer in parsedAnswers)
        {
            foreach (var selectedOption in answer.Options)
            {
                if (!optionCounts.ContainsKey(selectedOption.Id))
                    optionCounts[selectedOption.Id] = 0;
                optionCounts[selectedOption.Id]++;
            }

            if (!string.IsNullOrEmpty(answer.Text))
                otherTexts.Add(answer.Text);
        }

        var totalResponses = rawAnswers.Count;

        analytics.AnswerOptions =
        [
            .. settings.Options.Select(option => new AnswerOptionStatsDto
            {
                OptionId = option.Id,
                Option = option.Text,
                Count = optionCounts.GetValueOrDefault(option.Id, 0),
                Percentage =
                    totalResponses > 0
                        ? (decimal)optionCounts.GetValueOrDefault(option.Id, 0)
                            / totalResponses
                            * 100
                        : 0,
            }),
        ];

        analytics.OtherCount = otherTexts.Count;
        analytics.OtherResponses = [.. otherTexts.Take(10)];
    }

    private static void BuildNumericAnalytics(
        QuestionAnalyticsDto analytics,
        QuestionSettings? settings,
        List<string> rawAnswers
    )
    {
        var parsedAnswers = rawAnswers
            .Select(AnswerValue.FromJson)
            .Where(a => !string.IsNullOrEmpty(a.Text) && int.TryParse(a.Text, out _))
            .Select(a => int.Parse(a.Text!))
            .ToList();

        if (parsedAnswers.Count == 0)
            return;

        analytics.AverageValue = parsedAnswers.Average();
        analytics.MinValue = parsedAnswers.Min();
        analytics.MaxValue = parsedAnswers.Max();

        // Distribution
        var min = settings?.MinValue ?? 1;
        var max = settings?.MaxValue ?? 5;

        analytics.AnswerOptions =
        [
            .. Enumerable
                .Range(min, max - min + 1)
                .Select(value => new AnswerOptionStatsDto
                {
                    OptionId = Guid.Empty, // No ID for numeric options
                    Option = value.ToString(),
                    Count = parsedAnswers.Count(a => a == value),
                    Percentage =
                        parsedAnswers.Count > 0
                            ? (decimal)parsedAnswers.Count(a => a == value)
                                / parsedAnswers.Count
                                * 100
                            : 0,
                }),
        ];
    }

    private static void BuildTextAnalytics(QuestionAnalyticsDto analytics, List<string> rawAnswers)
    {
        var texts = rawAnswers
            .Select(AnswerValue.FromJson)
            .Where(a => !string.IsNullOrEmpty(a.Text))
            .Select(a => a.Text!)
            .ToList();

        analytics.SampleAnswers = [.. texts.Take(10)];
    }

    private static void BuildNumberAnalytics(
        QuestionAnalyticsDto analytics,
        List<string> rawAnswers
    )
    {
        var numbers = rawAnswers
            .Select(AnswerValue.FromJson)
            .Where(a => !string.IsNullOrEmpty(a.Text) && decimal.TryParse(a.Text, out _))
            .Select(a => (double)decimal.Parse(a.Text!))
            .ToList();

        if (numbers.Count == 0)
            return;

        analytics.AverageValue = numbers.Average();
        analytics.MinValue = (int)numbers.Min();
        analytics.MaxValue = (int)numbers.Max();
    }

    private static void BuildRankingAnalytics(
        QuestionAnalyticsDto analytics,
        QuestionSettings? settings,
        List<string> rawAnswers
    )
    {
        if (settings?.Options == null || settings.Options.Count == 0)
            return;

        // For ranking, calculate average position for each option
        var positionSums = new Dictionary<Guid, int>();
        var positionCounts = new Dictionary<Guid, int>();

        foreach (var rawAnswer in rawAnswers)
        {
            var answer = AnswerValue.FromJson(rawAnswer);
            for (int i = 0; i < answer.Options.Count; i++)
            {
                var optionId = answer.Options[i].Id;
                positionSums[optionId] = positionSums.GetValueOrDefault(optionId, 0) + (i + 1);
                positionCounts[optionId] = positionCounts.GetValueOrDefault(optionId, 0) + 1;
            }
        }

        var totalResponses = rawAnswers.Count;

        analytics.AnswerOptions =
        [
            .. settings
                .Options.Select(option =>
                {
                    var avgPosition =
                        positionCounts.TryGetValue(option.Id, out var count) && count > 0
                            ? (double)positionSums[option.Id] / count
                            : 0;
                    return new AnswerOptionStatsDto
                    {
                        OptionId = option.Id,
                        Option = option.Text,
                        Count = positionCounts.GetValueOrDefault(option.Id, 0),
                        // Use percentage to store average position (multiplied by 10 for precision)
                        Percentage = (decimal)avgPosition,
                    };
                })
                .OrderBy(o => o.Percentage), // Order by average position (best ranked first)
        ];
    }

    private static void BuildMatrixAnalytics(
        QuestionAnalyticsDto analytics,
        List<string> rawAnswers
    )
    {
        // Parse matrix answers and count row-column combinations
        var matrixCounts = new Dictionary<string, int>();

        foreach (var rawAnswer in rawAnswers)
        {
            var answer = AnswerValue.FromJson(rawAnswer);
            if (string.IsNullOrEmpty(answer.Text))
                continue;

            try
            {
                var matrix = System.Text.Json.JsonSerializer.Deserialize<
                    Dictionary<string, string>
                >(answer.Text);
                if (matrix == null)
                    continue;

                foreach (var (row, col) in matrix)
                {
                    var key = $"{row}|{col}";
                    matrixCounts[key] = matrixCounts.GetValueOrDefault(key, 0) + 1;
                }
            }
            catch
            {
                // Invalid JSON, skip
            }
        }

        // Store as sample answers for now (matrix analytics need special UI)
        analytics.SampleAnswers = [.. matrixCounts.Take(10).Select(kv => $"{kv.Key}: {kv.Value}")];
    }

    private static void BuildDateAnalytics(QuestionAnalyticsDto analytics, List<string> rawAnswers)
    {
        var dates = rawAnswers
            .Select(AnswerValue.FromJson)
            .Where(a => !string.IsNullOrEmpty(a.Text) && DateTime.TryParse(a.Text, out _))
            .Select(a => DateTime.Parse(a.Text!))
            .ToList();

        if (dates.Count == 0)
            return;

        analytics.SampleAnswers =
        [
            $"Earliest: {dates.Min():yyyy-MM-dd}",
            $"Latest: {dates.Max():yyyy-MM-dd}",
        ];
    }

    private static void BuildFileUploadAnalytics(
        QuestionAnalyticsDto analytics,
        List<string> rawAnswers
    )
    {
        var fileCount = 0;

        foreach (var rawAnswer in rawAnswers)
        {
            var answer = AnswerValue.FromJson(rawAnswer);
            if (string.IsNullOrEmpty(answer.Text))
                continue;

            try
            {
                var files = System.Text.Json.JsonSerializer.Deserialize<List<string>>(answer.Text);
                fileCount += files?.Count ?? 0;
            }
            catch
            {
                // Single file or invalid format
                fileCount++;
            }
        }

        analytics.SampleAnswers = [$"Total files uploaded: {fileCount}"];
    }
}
