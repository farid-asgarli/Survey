namespace SurveyApp.Domain.Enums;

/// <summary>
/// Represents the action to take when conditional logic is triggered.
/// </summary>
public enum LogicAction
{
    /// <summary>
    /// Show this question if condition is met.
    /// </summary>
    Show = 0,

    /// <summary>
    /// Hide this question if condition is met.
    /// </summary>
    Hide = 1,

    /// <summary>
    /// Skip this question and move to next.
    /// </summary>
    Skip = 2,

    /// <summary>
    /// Jump to a specific question.
    /// </summary>
    JumpTo = 3,

    /// <summary>
    /// End the survey immediately.
    /// </summary>
    EndSurvey = 4,
}
