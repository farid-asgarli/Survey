namespace SurveyApp.Domain.Enums;

/// <summary>
/// Represents the category of an NPS score.
/// </summary>
public enum NpsCategory
{
    /// <summary>
    /// Score below 0 - Needs significant improvement.
    /// </summary>
    NeedsImprovement = 0,

    /// <summary>
    /// Score between 0 and 49 - Good performance.
    /// </summary>
    Good = 1,

    /// <summary>
    /// Score between 50 and 69 - Great performance.
    /// </summary>
    Great = 2,

    /// <summary>
    /// Score 70 and above - Excellent performance.
    /// </summary>
    Excellent = 3,
}
