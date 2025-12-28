namespace SurveyApp.Domain.Enums;

/// <summary>
/// Represents the style of progress bar displayed in a survey.
/// </summary>
public enum ProgressBarStyle
{
    /// <summary>
    /// No progress bar displayed.
    /// </summary>
    None = 0,

    /// <summary>
    /// Horizontal bar indicator.
    /// </summary>
    Bar = 1,

    /// <summary>
    /// Percentage text display.
    /// </summary>
    Percentage = 2,

    /// <summary>
    /// Step indicator (e.g., 1/5, 2/5).
    /// </summary>
    Steps = 3,

    /// <summary>
    /// Dot indicators for each section.
    /// </summary>
    Dots = 4,
}
