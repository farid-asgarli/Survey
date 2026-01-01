namespace SurveyApp.API.Models;

/// <summary>
/// Request model for updating a single survey translation.
/// The language code is provided in the URL.
/// </summary>
public record UpdateSurveyTranslationRequest
{
    /// <summary>
    /// The translated title of the survey.
    /// </summary>
    public string Title { get; init; } = null!;

    /// <summary>
    /// The translated description of the survey.
    /// </summary>
    public string? Description { get; init; }

    /// <summary>
    /// The translated welcome message shown at the start of the survey.
    /// </summary>
    public string? WelcomeMessage { get; init; }

    /// <summary>
    /// The translated thank you message shown at the end of the survey.
    /// </summary>
    public string? ThankYouMessage { get; init; }
}
