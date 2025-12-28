namespace SurveyApp.Domain.Enums;

/// <summary>
/// Represents the positioning of a background image in a survey theme.
/// </summary>
public enum BackgroundImagePosition
{
    /// <summary>
    /// Image covers the entire background.
    /// </summary>
    Cover = 0,

    /// <summary>
    /// Image is contained within the background.
    /// </summary>
    Contain = 1,

    /// <summary>
    /// Image is tiled/repeated.
    /// </summary>
    Tile = 2,

    /// <summary>
    /// Image is centered.
    /// </summary>
    Center = 3,

    /// <summary>
    /// Image is positioned at top left.
    /// </summary>
    TopLeft = 4,

    /// <summary>
    /// Image is positioned at top right.
    /// </summary>
    TopRight = 5,
}
