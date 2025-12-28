namespace SurveyApp.Domain.Enums;

/// <summary>
/// Represents the visual display style for Yes/No questions.
/// </summary>
public enum YesNoStyle
{
    /// <summary>
    /// Standard radio buttons with text labels (default).
    /// </summary>
    Text = 0,

    /// <summary>
    /// Thumbs up / thumbs down icons.
    /// </summary>
    Thumbs = 1,

    /// <summary>
    /// Toggle switch style.
    /// </summary>
    Toggle = 2,

    /// <summary>
    /// Check mark / X mark icons.
    /// </summary>
    CheckX = 3,
}
