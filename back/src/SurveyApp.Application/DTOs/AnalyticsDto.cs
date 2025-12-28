namespace SurveyApp.Application.DTOs;

/// <summary>
/// DTO for survey analytics data.
/// </summary>
public class SurveyAnalyticsDto
{
    public Guid SurveyId { get; set; }
    public string SurveyTitle { get; set; } = null!;
    public int TotalResponses { get; set; }
    public int CompletedResponses { get; set; }
    public int PartialResponses { get; set; }
    public decimal CompletionRate { get; set; }
    public double AverageCompletionTimeSeconds { get; set; }
    public DateTime? FirstResponseAt { get; set; }
    public DateTime? LastResponseAt { get; set; }
    public Dictionary<DateTime, int>? ResponsesByDate { get; set; }
    public IReadOnlyList<QuestionAnalyticsDto> Questions { get; set; } = [];
}

/// <summary>
/// DTO for question analytics data.
/// </summary>
public class QuestionAnalyticsDto
{
    public Guid QuestionId { get; set; }
    public string QuestionText { get; set; } = null!;
    public string QuestionType { get; set; } = null!;
    public int TotalAnswers { get; set; }
    public int SkippedCount { get; set; }
    public IReadOnlyList<AnswerOptionStatsDto>? AnswerOptions { get; set; }
    public double? AverageRating { get; set; }
    public double? AverageValue { get; set; }
    public int? MinValue { get; set; }
    public int? MaxValue { get; set; }
    public IReadOnlyList<string>? SampleAnswers { get; set; }
}

/// <summary>
/// DTO for answer option statistics.
/// </summary>
public class AnswerOptionStatsDto
{
    public string Option { get; set; } = null!;
    public int Count { get; set; }
    public decimal Percentage { get; set; }
}
