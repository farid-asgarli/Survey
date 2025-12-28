namespace SurveyApp.Domain.Enums;

/// <summary>
/// Represents the layout style for a survey theme.
/// </summary>
public enum ThemeLayout
{
    /// <summary>
    /// Traditional form layout with all questions visible.
    /// </summary>
    Classic = 0,

    /// <summary>
    /// One question per card/page.
    /// </summary>
    Card = 1,

    /// <summary>
    /// Chat-like conversational interface.
    /// </summary>
    Conversational = 2,

    /// <summary>
    /// Clean, minimal design.
    /// </summary>
    Minimal = 3,
}
