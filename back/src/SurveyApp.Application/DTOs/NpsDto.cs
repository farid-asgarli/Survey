using SurveyApp.Domain.Enums;

namespace SurveyApp.Application.DTOs;

/// <summary>
/// DTO for Net Promoter Score results.
/// </summary>
public class NpsScoreDto
{
    /// <summary>
    /// Gets or sets the calculated NPS score (-100 to 100).
    /// </summary>
    public decimal Score { get; set; }

    /// <summary>
    /// Gets or sets the count of promoters (scores 9-10).
    /// </summary>
    public int Promoters { get; set; }

    /// <summary>
    /// Gets or sets the count of passives (scores 7-8).
    /// </summary>
    public int Passives { get; set; }

    /// <summary>
    /// Gets or sets the count of detractors (scores 0-6).
    /// </summary>
    public int Detractors { get; set; }

    /// <summary>
    /// Gets or sets the total number of responses.
    /// </summary>
    public int TotalResponses { get; set; }

    /// <summary>
    /// Gets or sets the percentage of promoters.
    /// </summary>
    public decimal PromoterPercentage { get; set; }

    /// <summary>
    /// Gets or sets the percentage of passives.
    /// </summary>
    public decimal PassivePercentage { get; set; }

    /// <summary>
    /// Gets or sets the percentage of detractors.
    /// </summary>
    public decimal DetractorPercentage { get; set; }

    /// <summary>
    /// Gets or sets the NPS category (NeedsImprovement, Good, Great, Excellent).
    /// </summary>
    public string Category { get; set; } = null!;

    /// <summary>
    /// Gets or sets the category description.
    /// </summary>
    public string CategoryDescription { get; set; } = null!;
}

/// <summary>
/// DTO for NPS trend data over time.
/// </summary>
public class NpsTrendDto
{
    /// <summary>
    /// Gets or sets the survey ID.
    /// </summary>
    public Guid SurveyId { get; set; }

    /// <summary>
    /// Gets or sets the trend data points.
    /// </summary>
    public List<NpsTrendPointDto> DataPoints { get; set; } = [];

    /// <summary>
    /// Gets or sets the average score across all data points.
    /// </summary>
    public decimal AverageScore { get; set; }

    /// <summary>
    /// Gets or sets the score change from the previous period.
    /// </summary>
    public decimal ChangeFromPrevious { get; set; }

    /// <summary>
    /// Gets or sets the trend direction (Up, Down, Stable).
    /// </summary>
    public string TrendDirection { get; set; } = null!;

    /// <summary>
    /// Gets or sets the start date of the trend period.
    /// </summary>
    public DateTime FromDate { get; set; }

    /// <summary>
    /// Gets or sets the end date of the trend period.
    /// </summary>
    public DateTime ToDate { get; set; }
}

/// <summary>
/// DTO for a single NPS trend data point.
/// </summary>
public class NpsTrendPointDto
{
    /// <summary>
    /// Gets or sets the date for this data point.
    /// </summary>
    public DateTime Date { get; set; }

    /// <summary>
    /// Gets or sets the NPS score for this data point.
    /// </summary>
    public decimal Score { get; set; }

    /// <summary>
    /// Gets or sets the number of responses for this data point.
    /// </summary>
    public int ResponseCount { get; set; }

    /// <summary>
    /// Gets or sets the count of promoters for this data point.
    /// </summary>
    public int Promoters { get; set; }

    /// <summary>
    /// Gets or sets the count of passives for this data point.
    /// </summary>
    public int Passives { get; set; }

    /// <summary>
    /// Gets or sets the count of detractors for this data point.
    /// </summary>
    public int Detractors { get; set; }
}

/// <summary>
/// DTO for NPS results segmented by different criteria.
/// </summary>
public class NpsSegmentDto
{
    /// <summary>
    /// Gets or sets the segment name (e.g., "Week 1", "January", "Mobile").
    /// </summary>
    public string SegmentName { get; set; } = null!;

    /// <summary>
    /// Gets or sets the segment value.
    /// </summary>
    public string? SegmentValue { get; set; }

    /// <summary>
    /// Gets or sets the NPS score for this segment.
    /// </summary>
    public NpsScoreDto NpsScore { get; set; } = null!;
}

/// <summary>
/// DTO for NPS results segmented by various criteria.
/// </summary>
public class NpsBySegmentDto
{
    /// <summary>
    /// Gets or sets the survey ID.
    /// </summary>
    public Guid SurveyId { get; set; }

    /// <summary>
    /// Gets or sets the overall NPS score.
    /// </summary>
    public NpsScoreDto OverallScore { get; set; } = null!;

    /// <summary>
    /// Gets or sets the segments with their NPS scores.
    /// </summary>
    public List<NpsSegmentDto> Segments { get; set; } = [];

    /// <summary>
    /// Gets or sets the segment type used for grouping.
    /// </summary>
    public string SegmentType { get; set; } = null!;
}

/// <summary>
/// DTO for NPS question information.
/// </summary>
public class NpsQuestionDto
{
    /// <summary>
    /// Gets or sets the question ID.
    /// </summary>
    public Guid QuestionId { get; set; }

    /// <summary>
    /// Gets or sets the question text.
    /// </summary>
    public string QuestionText { get; set; } = null!;

    /// <summary>
    /// Gets or sets the NPS question type.
    /// </summary>
    public NpsQuestionType NpsType { get; set; }

    /// <summary>
    /// Gets or sets the NPS score for this question.
    /// </summary>
    public NpsScoreDto Score { get; set; } = null!;
}

/// <summary>
/// DTO for survey NPS summary including all NPS questions.
/// </summary>
public class SurveyNpsSummaryDto
{
    /// <summary>
    /// Gets or sets the survey ID.
    /// </summary>
    public Guid SurveyId { get; set; }

    /// <summary>
    /// Gets or sets the survey title.
    /// </summary>
    public string SurveyTitle { get; set; } = null!;

    /// <summary>
    /// Gets or sets the overall NPS score for the survey (if applicable).
    /// </summary>
    public NpsScoreDto? OverallScore { get; set; }

    /// <summary>
    /// Gets or sets the NPS scores for each NPS question in the survey.
    /// </summary>
    public List<NpsQuestionDto> Questions { get; set; } = [];

    /// <summary>
    /// Gets or sets the date range of responses included.
    /// </summary>
    public DateTime? FromDate { get; set; }

    /// <summary>
    /// Gets or sets the end date of responses included.
    /// </summary>
    public DateTime? ToDate { get; set; }
}
