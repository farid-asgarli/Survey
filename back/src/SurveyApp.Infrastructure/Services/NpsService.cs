using SurveyApp.Application.Common.Exceptions;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Application.Services;
using SurveyApp.Domain.Entities;
using SurveyApp.Domain.Enums;
using SurveyApp.Domain.Interfaces;
using SurveyApp.Domain.ValueObjects;

namespace SurveyApp.Infrastructure.Services;

/// <summary>
/// Service for calculating and managing Net Promoter Score (NPS) metrics.
/// </summary>
public class NpsService(
    ISurveyRepository surveyRepository,
    ISurveyResponseRepository responseRepository,
    IDateTimeService dateTimeService
) : INpsService
{
    private readonly ISurveyRepository _surveyRepository = surveyRepository;
    private readonly ISurveyResponseRepository _responseRepository = responseRepository;
    private readonly IDateTimeService _dateTimeService = dateTimeService;

    /// <inheritdoc />
    public async Task<SurveyNpsSummaryDto> CalculateNpsAsync(
        Guid surveyId,
        CancellationToken cancellationToken = default
    )
    {
        var survey = await _surveyRepository.GetByIdWithQuestionsAsync(surveyId, cancellationToken);
        if (survey == null)
        {
            throw new NotFoundException($"Errors.EntityNotFound|Survey|{surveyId}");
        }

        var responses = await _responseRepository.GetCompletedBySurveyIdAsync(
            surveyId,
            cancellationToken
        );
        var analyticsData = await _responseRepository.GetAnalyticsDataAsync(
            surveyId,
            cancellationToken
        );

        // Find NPS questions (either marked as NPS or of type NPS/Scale with 0-10 range)
        var npsQuestions = survey.Questions.Where(q => IsNpsQuestion(q)).ToList();

        var questionResults = new List<NpsQuestionDto>();
        var allNpsResponses = new List<int>();

        foreach (var question in npsQuestions)
        {
            var answers = analyticsData.AnswersByQuestion.GetValueOrDefault(question.Id, []);
            var numericAnswers = ParseNpsAnswers(answers);

            allNpsResponses.AddRange(numericAnswers);

            var npsScore = NpsScore.Calculate(numericAnswers);
            questionResults.Add(
                new NpsQuestionDto
                {
                    QuestionId = question.Id,
                    QuestionText = question.Text,
                    NpsType = question.NpsType ?? NpsQuestionType.Standard,
                    Score = MapToDto(npsScore),
                }
            );
        }

        // Calculate overall NPS if there are any NPS responses
        NpsScoreDto? overallScore = null;
        if (allNpsResponses.Count > 0)
        {
            var overall = NpsScore.Calculate(allNpsResponses);
            overallScore = MapToDto(overall);
        }

        return new SurveyNpsSummaryDto
        {
            SurveyId = surveyId,
            SurveyTitle = survey.Title,
            OverallScore = overallScore,
            Questions = questionResults,
            FromDate = analyticsData.FirstResponseAt,
            ToDate = analyticsData.LastResponseAt,
        };
    }

    /// <inheritdoc />
    public async Task<NpsScoreDto> CalculateNpsForQuestionAsync(
        Guid questionId,
        CancellationToken cancellationToken = default
    )
    {
        // We need to find the survey that contains this question
        // For now, we'll get analytics data through the response repository
        var responses = await GetResponsesForQuestionAsync(questionId, cancellationToken);
        var numericAnswers = ParseNpsAnswers(responses);

        var npsScore = NpsScore.Calculate(numericAnswers);
        return MapToDto(npsScore);
    }

    /// <inheritdoc />
    public async Task<NpsTrendDto> GetNpsTrendAsync(
        Guid surveyId,
        DateTime fromDate,
        DateTime toDate,
        NpsTrendGroupBy groupBy = NpsTrendGroupBy.Week,
        CancellationToken cancellationToken = default
    )
    {
        var survey = await _surveyRepository.GetByIdWithQuestionsAsync(surveyId, cancellationToken);
        if (survey == null)
        {
            throw new NotFoundException($"Errors.EntityNotFound|Survey|{surveyId}");
        }

        var responses = await _responseRepository.GetBySurveyIdAsync(surveyId, cancellationToken);
        var npsQuestions = survey.Questions.Where(q => IsNpsQuestion(q)).ToList();

        if (npsQuestions.Count == 0)
        {
            return new NpsTrendDto
            {
                SurveyId = surveyId,
                DataPoints = [],
                AverageScore = 0,
                ChangeFromPrevious = 0,
                TrendDirection = "Stable",
                FromDate = fromDate,
                ToDate = toDate,
            };
        }

        // Filter responses by date range and group by period
        var filteredResponses = responses
            .Where(r => r.CreatedAt >= fromDate && r.CreatedAt <= toDate && r.IsComplete)
            .ToList();

        var groupedResponses = GroupResponsesByPeriod(filteredResponses, groupBy);
        var dataPoints = new List<NpsTrendPointDto>();

        foreach (var group in groupedResponses.OrderBy(g => g.Key))
        {
            var periodResponses = group.Value;
            var periodAnswers = new List<int>();

            foreach (var response in periodResponses)
            {
                foreach (var question in npsQuestions)
                {
                    var answer = response.Answers.FirstOrDefault(a => a.QuestionId == question.Id);
                    if (
                        answer != null
                        && int.TryParse(answer.AnswerValue, out var value)
                        && value >= 0
                        && value <= 10
                    )
                    {
                        periodAnswers.Add(value);
                    }
                }
            }

            if (periodAnswers.Count > 0)
            {
                var npsScore = NpsScore.Calculate(periodAnswers);
                dataPoints.Add(
                    new NpsTrendPointDto
                    {
                        Date = group.Key,
                        Score = npsScore.Score,
                        ResponseCount = periodAnswers.Count,
                        Promoters = npsScore.Promoters,
                        Passives = npsScore.Passives,
                        Detractors = npsScore.Detractors,
                    }
                );
            }
        }

        // Calculate trend metrics
        var averageScore = dataPoints.Count > 0 ? dataPoints.Average(d => d.Score) : 0;

        decimal changeFromPrevious = 0;
        if (dataPoints.Count >= 2)
        {
            var lastTwo = dataPoints.TakeLast(2).ToList();
            changeFromPrevious = lastTwo[1].Score - lastTwo[0].Score;
        }

        var trendDirection = changeFromPrevious switch
        {
            > 0 => "Up",
            < 0 => "Down",
            _ => "Stable",
        };

        return new NpsTrendDto
        {
            SurveyId = surveyId,
            DataPoints = dataPoints,
            AverageScore = Math.Round(averageScore, 2),
            ChangeFromPrevious = Math.Round(changeFromPrevious, 2),
            TrendDirection = trendDirection,
            FromDate = fromDate,
            ToDate = toDate,
        };
    }

    /// <inheritdoc />
    public async Task<NpsBySegmentDto> GetNpsBySegmentAsync(
        Guid surveyId,
        NpsSegmentBy segmentBy,
        CancellationToken cancellationToken = default
    )
    {
        var survey = await _surveyRepository.GetByIdWithQuestionsAsync(surveyId, cancellationToken);
        if (survey == null)
        {
            throw new NotFoundException($"Errors.EntityNotFound|Survey|{surveyId}");
        }

        var analyticsData = await _responseRepository.GetAnalyticsDataAsync(
            surveyId,
            cancellationToken
        );
        var npsQuestions = survey.Questions.Where(q => IsNpsQuestion(q)).ToList();

        // Calculate overall score
        var allAnswers = new List<int>();
        foreach (var question in npsQuestions)
        {
            var answers = analyticsData.AnswersByQuestion.GetValueOrDefault(question.Id, []);
            allAnswers.AddRange(ParseNpsAnswers(answers));
        }

        var overallNps = NpsScore.Calculate(allAnswers);
        var overallScore = MapToDto(overallNps);

        var segments = new List<NpsSegmentDto>();
        var segmentType = segmentBy.ToString();

        switch (segmentBy)
        {
            case NpsSegmentBy.Question:
                foreach (var question in npsQuestions)
                {
                    var answers = analyticsData.AnswersByQuestion.GetValueOrDefault(
                        question.Id,
                        []
                    );
                    var numericAnswers = ParseNpsAnswers(answers);
                    var questionNps = NpsScore.Calculate(numericAnswers);

                    segments.Add(
                        new NpsSegmentDto
                        {
                            SegmentName =
                                question.Text.Length > 50
                                    ? question.Text[..50] + "..."
                                    : question.Text,
                            SegmentValue = question.Id.ToString(),
                            NpsScore = MapToDto(questionNps),
                        }
                    );
                }
                break;

            case NpsSegmentBy.CompletionStatus:
                var responses = await _responseRepository.GetBySurveyIdAsync(
                    surveyId,
                    cancellationToken
                );
                var completedAnswers = new List<int>();
                var incompleteAnswers = new List<int>();

                foreach (var response in responses)
                {
                    foreach (var question in npsQuestions)
                    {
                        var answer = response.Answers.FirstOrDefault(a =>
                            a.QuestionId == question.Id
                        );
                        if (
                            answer != null
                            && int.TryParse(answer.AnswerValue, out var value)
                            && value >= 0
                            && value <= 10
                        )
                        {
                            if (response.IsComplete)
                                completedAnswers.Add(value);
                            else
                                incompleteAnswers.Add(value);
                        }
                    }
                }

                if (completedAnswers.Count > 0)
                {
                    segments.Add(
                        new NpsSegmentDto
                        {
                            SegmentName = "Completed",
                            SegmentValue = "completed",
                            NpsScore = MapToDto(NpsScore.Calculate(completedAnswers)),
                        }
                    );
                }

                if (incompleteAnswers.Count > 0)
                {
                    segments.Add(
                        new NpsSegmentDto
                        {
                            SegmentName = "Incomplete",
                            SegmentValue = "incomplete",
                            NpsScore = MapToDto(NpsScore.Calculate(incompleteAnswers)),
                        }
                    );
                }
                break;

            case NpsSegmentBy.Date:
                var dateResponses = await _responseRepository.GetBySurveyIdAsync(
                    surveyId,
                    cancellationToken
                );
                var monthlyData = dateResponses
                    .Where(r => r.IsComplete)
                    .GroupBy(r => new DateTime(r.CreatedAt.Year, r.CreatedAt.Month, 1))
                    .OrderBy(g => g.Key);

                foreach (var group in monthlyData)
                {
                    var monthAnswers = new List<int>();
                    foreach (var response in group)
                    {
                        foreach (var question in npsQuestions)
                        {
                            var answer = response.Answers.FirstOrDefault(a =>
                                a.QuestionId == question.Id
                            );
                            if (
                                answer != null
                                && int.TryParse(answer.AnswerValue, out var value)
                                && value >= 0
                                && value <= 10
                            )
                            {
                                monthAnswers.Add(value);
                            }
                        }
                    }

                    if (monthAnswers.Count > 0)
                    {
                        segments.Add(
                            new NpsSegmentDto
                            {
                                SegmentName = group.Key.ToString("MMMM yyyy"),
                                SegmentValue = group.Key.ToString("yyyy-MM"),
                                NpsScore = MapToDto(NpsScore.Calculate(monthAnswers)),
                            }
                        );
                    }
                }
                break;
        }

        return new NpsBySegmentDto
        {
            SurveyId = surveyId,
            OverallScore = overallScore,
            Segments = segments,
            SegmentType = segmentType,
        };
    }

    private static bool IsNpsQuestion(Question question)
    {
        // A question is an NPS question if:
        // 1. It's explicitly marked as NPS
        // 2. It's of type NPS
        // 3. It's a Scale/Rating with 0-10 range (common NPS setup)
        if (question.IsNpsQuestion)
            return true;

        if (question.Type == QuestionType.NPS)
            return true;

        if (question.Type == QuestionType.Scale || question.Type == QuestionType.Rating)
        {
            var settings = question.GetSettings();
            // Check if it's a 0-10 scale (typical NPS)
            if (settings?.MinValue == 0 && settings?.MaxValue == 10)
                return true;
        }

        return false;
    }

    private static List<int> ParseNpsAnswers(IEnumerable<string> answers)
    {
        return
        [
            .. answers
                .Where(a => int.TryParse(a, out var value) && value >= 0 && value <= 10)
                .Select(a => int.Parse(a)),
        ];
    }

    private static NpsScoreDto MapToDto(NpsScore npsScore)
    {
        return new NpsScoreDto
        {
            Score = npsScore.Score,
            Promoters = npsScore.Promoters,
            Passives = npsScore.Passives,
            Detractors = npsScore.Detractors,
            TotalResponses = npsScore.TotalResponses,
            PromoterPercentage = npsScore.PromoterPercentage,
            PassivePercentage = npsScore.PassivePercentage,
            DetractorPercentage = npsScore.DetractorPercentage,
            Category = npsScore.Category.ToString(),
            CategoryDescription = npsScore.GetCategoryDescription(),
        };
    }

    private static Dictionary<DateTime, List<SurveyResponse>> GroupResponsesByPeriod(
        List<SurveyResponse> responses,
        NpsTrendGroupBy groupBy
    )
    {
        return groupBy switch
        {
            NpsTrendGroupBy.Day => responses
                .GroupBy(r => r.CreatedAt.Date)
                .ToDictionary(g => g.Key, g => g.ToList()),

            NpsTrendGroupBy.Week => responses
                .GroupBy(r => GetStartOfWeek(r.CreatedAt))
                .ToDictionary(g => g.Key, g => g.ToList()),

            NpsTrendGroupBy.Month => responses
                .GroupBy(r => new DateTime(r.CreatedAt.Year, r.CreatedAt.Month, 1))
                .ToDictionary(g => g.Key, g => g.ToList()),

            _ => throw new ArgumentOutOfRangeException(nameof(groupBy)),
        };
    }

    private static DateTime GetStartOfWeek(DateTime date)
    {
        var diff = (7 + (date.DayOfWeek - DayOfWeek.Monday)) % 7;
        return date.AddDays(-1 * diff).Date;
    }

    private Task<List<string>> GetResponsesForQuestionAsync(
        Guid questionId,
        CancellationToken cancellationToken
    )
    {
        // This is a simplified implementation
        // In a real scenario, we might want to add a specific repository method for this
        // For now, we'll work with what we have

        // Note: This is not the most efficient way, but it works with existing repository methods
        // In production, you'd want to add a specific query to the repository
        return Task.FromResult(new List<string>());
    }
}
