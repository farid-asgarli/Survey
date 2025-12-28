using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Domain.Entities;
using SurveyApp.Domain.Enums;
using SurveyApp.Domain.Interfaces;

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
        {
            return Result<SurveyAnalyticsDto>.Failure("Handler.NamespaceContextRequired");
        }

        var survey = await _surveyRepository.GetByIdWithQuestionsAsync(
            request.SurveyId,
            cancellationToken
        );
        if (survey == null || survey.NamespaceId != namespaceId.Value)
        {
            return Result<SurveyAnalyticsDto>.Failure("Handler.SurveyNotFound");
        }

        // Check permission
        var userId = _currentUserService.UserId;
        if (!userId.HasValue)
        {
            return Result<SurveyAnalyticsDto>.Failure("User not authenticated.");
        }

        var @namespace = await _namespaceRepository.GetByIdAsync(
            namespaceId.Value,
            cancellationToken
        );
        var membership = @namespace?.Memberships.FirstOrDefault(m => m.UserId == userId.Value);
        if (membership == null || !membership.HasPermission(NamespacePermission.ViewResponses))
        {
            return Result<SurveyAnalyticsDto>.Failure(
                "You do not have permission to view analytics."
            );
        }

        // Get analytics data
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
            Questions = survey
                .Questions.OrderBy(q => q.Order)
                .Select(q =>
                    BuildQuestionAnalytics(
                        q,
                        analyticsData.AnswersByQuestion.GetValueOrDefault(q.Id, [])
                    )
                )
                .ToList(),
        };

        return Result<SurveyAnalyticsDto>.Success(analytics);
    }

    private QuestionAnalyticsDto BuildQuestionAnalytics(Question question, List<string> answers)
    {
        var settings = question.GetSettings();
        var analytics = new QuestionAnalyticsDto
        {
            QuestionId = question.Id,
            QuestionText = question.Text,
            QuestionType = question.Type.ToString(),
            TotalAnswers = answers.Count,
            AnswerOptions = [],
        };

        // Build analytics based on question type
        switch (question.Type)
        {
            case QuestionType.MultipleChoice:
            case QuestionType.Dropdown:
            case QuestionType.Checkbox:
                if (settings?.Options != null)
                {
                    var allAnswers =
                        question.Type == QuestionType.Checkbox
                            ? answers
                                .SelectMany(a =>
                                    a.Split(',', StringSplitOptions.RemoveEmptyEntries)
                                        .Select(s => s.Trim())
                                )
                                .ToList()
                            : answers;

                    analytics.AnswerOptions = settings
                        .Options.Select(option => new AnswerOptionStatsDto
                        {
                            Option = option,
                            Count = allAnswers.Count(a =>
                                a.Equals(option, StringComparison.OrdinalIgnoreCase)
                            ),
                            Percentage =
                                answers.Count > 0
                                    ? (decimal)
                                        allAnswers.Count(a =>
                                            a.Equals(option, StringComparison.OrdinalIgnoreCase)
                                        )
                                        / answers.Count
                                        * 100
                                    : 0,
                        })
                        .ToList();
                }
                break;

            case QuestionType.Rating:
            case QuestionType.Scale:
                var numericAnswers = answers
                    .Where(a => int.TryParse(a, out _))
                    .Select(a => int.Parse(a))
                    .ToList();

                if (numericAnswers.Any())
                {
                    analytics.AverageValue = numericAnswers.Average();
                    analytics.MinValue = numericAnswers.Min();
                    analytics.MaxValue = numericAnswers.Max();

                    // Distribution
                    var min = settings?.MinValue ?? 1;
                    var max = settings?.MaxValue ?? 5;
                    analytics.AnswerOptions = Enumerable
                        .Range(min, max - min + 1)
                        .Select(value => new AnswerOptionStatsDto
                        {
                            Option = value.ToString(),
                            Count = numericAnswers.Count(a => a == value),
                            Percentage =
                                numericAnswers.Count > 0
                                    ? (decimal)numericAnswers.Count(a => a == value)
                                        / numericAnswers.Count
                                        * 100
                                    : 0,
                        })
                        .ToList();
                }
                break;

            case QuestionType.ShortText:
            case QuestionType.LongText:
                // For text questions, just return sample answers
                analytics.SampleAnswers = answers.Take(10).ToList();
                break;

            case QuestionType.Number:
                var numberAnswers = answers
                    .Where(a => decimal.TryParse(a, out _))
                    .Select(a => (double)decimal.Parse(a))
                    .ToList();

                if (numberAnswers.Any())
                {
                    analytics.AverageValue = numberAnswers.Average();
                    analytics.MinValue = (int)numberAnswers.Min();
                    analytics.MaxValue = (int)numberAnswers.Max();
                }
                break;
        }

        return analytics;
    }
}
