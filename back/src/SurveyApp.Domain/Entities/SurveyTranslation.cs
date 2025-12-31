using SurveyApp.Domain.Common;

namespace SurveyApp.Domain.Entities;

/// <summary>
/// Represents a translation for a Survey entity.
/// </summary>
public class SurveyTranslation : Translation
{
    /// <summary>
    /// Gets the ID of the survey this translation belongs to.
    /// </summary>
    public Guid SurveyId { get; private set; }

    /// <summary>
    /// Gets the translated title of the survey.
    /// </summary>
    public string Title { get; private set; } = null!;

    /// <summary>
    /// Gets the translated description of the survey.
    /// </summary>
    public string? Description { get; private set; }

    /// <summary>
    /// Gets the translated welcome message shown at the start of the survey.
    /// </summary>
    public string? WelcomeMessage { get; private set; }

    /// <summary>
    /// Gets the translated thank you message shown at the end of the survey.
    /// </summary>
    public string? ThankYouMessage { get; private set; }

    /// <summary>
    /// Navigation property to the parent survey.
    /// </summary>
    public Survey Survey { get; private set; } = null!;

    private SurveyTranslation() { }

    private SurveyTranslation(
        Guid id,
        Guid surveyId,
        string languageCode,
        string title,
        string? description,
        string? welcomeMessage,
        string? thankYouMessage,
        bool isDefault
    )
        : base(id, languageCode, isDefault)
    {
        SurveyId = surveyId;
        Title = title;
        Description = description;
        WelcomeMessage = welcomeMessage;
        ThankYouMessage = thankYouMessage;
    }

    /// <summary>
    /// Creates a new survey translation.
    /// </summary>
    public static SurveyTranslation Create(
        Guid surveyId,
        string languageCode,
        string title,
        string? description = null,
        string? welcomeMessage = null,
        string? thankYouMessage = null,
        bool isDefault = false
    )
    {
        if (string.IsNullOrWhiteSpace(languageCode))
            throw new DomainException("Domain.SurveyTranslation.LanguageCodeRequired");

        if (string.IsNullOrWhiteSpace(title))
            throw new DomainException("Domain.SurveyTranslation.TitleRequired");

        return new SurveyTranslation(
            Guid.NewGuid(),
            surveyId,
            languageCode.ToLowerInvariant(),
            title.Trim(),
            description?.Trim(),
            welcomeMessage?.Trim(),
            thankYouMessage?.Trim(),
            isDefault
        );
    }

    /// <summary>
    /// Updates the translation content.
    /// </summary>
    public void Update(
        string title,
        string? description,
        string? welcomeMessage,
        string? thankYouMessage,
        Guid? userId = null
    )
    {
        if (string.IsNullOrWhiteSpace(title))
            throw new DomainException("Domain.SurveyTranslation.TitleRequired");

        Title = title.Trim();
        Description = description?.Trim();
        WelcomeMessage = welcomeMessage?.Trim();
        ThankYouMessage = thankYouMessage?.Trim();
        MarkAsModified(userId);
    }
}
