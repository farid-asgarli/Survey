namespace SurveyApp.Domain.Enums;

/// <summary>
/// Represents the visual display style for rating questions.
/// </summary>
public enum RatingStyle
{
    /// <summary>
    /// Star icons (default).
    /// </summary>
    Stars = 0,

    /// <summary>
    /// Heart icons.
    /// </summary>
    Hearts = 1,

    /// <summary>
    /// Thumbs up icons (accumulated).
    /// </summary>
    Thumbs = 2,

    /// <summary>
    /// Emoji/smiley face icons representing sentiment (sad to happy).
    /// </summary>
    Smileys = 3,

    /// <summary>
    /// Numeric display only (1, 2, 3, 4, 5).
    /// </summary>
    Numbers = 4,
}
