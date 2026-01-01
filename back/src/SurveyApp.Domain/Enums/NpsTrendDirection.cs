namespace SurveyApp.Domain.Enums;

/// <summary>
/// Represents the direction of an NPS trend.
/// </summary>
public enum NpsTrendDirection
{
    /// <summary>
    /// NPS score is increasing.
    /// </summary>
    Up = 0,

    /// <summary>
    /// NPS score is decreasing.
    /// </summary>
    Down = 1,

    /// <summary>
    /// NPS score is stable (no significant change).
    /// </summary>
    Stable = 2,
}
