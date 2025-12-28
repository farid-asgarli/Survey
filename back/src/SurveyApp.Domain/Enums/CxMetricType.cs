namespace SurveyApp.Domain.Enums;

/// <summary>
/// Represents the type of Customer Experience metric.
/// </summary>
public enum CxMetricType
{
    /// <summary>
    /// Net Promoter Score (NPS) - measures customer loyalty.
    /// Scale: 0-10 with "How likely are you to recommend?"
    /// </summary>
    NPS = 0,

    /// <summary>
    /// Customer Effort Score (CES) - measures ease of experience.
    /// Scale: 1-7 with "How easy was it to..."
    /// </summary>
    CES = 1,

    /// <summary>
    /// Customer Satisfaction Score (CSAT) - measures overall satisfaction.
    /// Scale: 1-5 with "How satisfied are you with..."
    /// </summary>
    CSAT = 2,
}
