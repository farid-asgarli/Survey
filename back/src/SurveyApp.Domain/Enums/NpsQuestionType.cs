namespace SurveyApp.Domain.Enums;

/// <summary>
/// Represents the type of NPS question.
/// </summary>
public enum NpsQuestionType
{
    /// <summary>
    /// Standard NPS question - "How likely are you to recommend?"
    /// </summary>
    Standard = 0,

    /// <summary>
    /// Customer Satisfaction (CSAT) question.
    /// </summary>
    CustomerSatisfaction = 1,

    /// <summary>
    /// Customer Effort Score (CES) question.
    /// </summary>
    CustomerEffort = 2,
}
