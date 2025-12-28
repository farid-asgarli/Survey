using SurveyApp.Domain.Common;

namespace SurveyApp.Domain.Entities;

/// <summary>
/// Represents a translation for a SurveyTemplate entity.
/// </summary>
public class SurveyTemplateTranslation : Translation
{
    /// <summary>
    /// Gets the ID of the template this translation belongs to.
    /// </summary>
    public Guid TemplateId { get; private set; }

    /// <summary>
    /// Gets the translated name of the template.
    /// </summary>
    public string Name { get; private set; } = null!;

    /// <summary>
    /// Gets the translated description of the template.
    /// </summary>
    public string? Description { get; private set; }

    /// <summary>
    /// Gets the translated category of the template.
    /// </summary>
    public string? Category { get; private set; }

    /// <summary>
    /// Gets the translated welcome message for surveys created from this template.
    /// </summary>
    public string? WelcomeMessage { get; private set; }

    /// <summary>
    /// Gets the translated thank you message for surveys created from this template.
    /// </summary>
    public string? ThankYouMessage { get; private set; }

    /// <summary>
    /// Navigation property to the parent template.
    /// </summary>
    public SurveyTemplate Template { get; private set; } = null!;

    private SurveyTemplateTranslation() { }

    private SurveyTemplateTranslation(
        Guid id,
        Guid templateId,
        string languageCode,
        string name,
        string? description,
        string? category,
        string? welcomeMessage,
        string? thankYouMessage,
        bool isDefault
    )
        : base(id, languageCode, isDefault)
    {
        TemplateId = templateId;
        Name = name;
        Description = description;
        Category = category;
        WelcomeMessage = welcomeMessage;
        ThankYouMessage = thankYouMessage;
    }

    /// <summary>
    /// Creates a new survey template translation.
    /// </summary>
    public static SurveyTemplateTranslation Create(
        Guid templateId,
        string languageCode,
        string name,
        string? description = null,
        string? category = null,
        string? welcomeMessage = null,
        string? thankYouMessage = null,
        bool isDefault = false
    )
    {
        if (string.IsNullOrWhiteSpace(languageCode))
            throw new ArgumentException("Language code is required.", nameof(languageCode));

        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Name is required.", nameof(name));

        return new SurveyTemplateTranslation(
            Guid.NewGuid(),
            templateId,
            languageCode.ToLowerInvariant(),
            name.Trim(),
            description?.Trim(),
            category?.Trim(),
            welcomeMessage?.Trim(),
            thankYouMessage?.Trim(),
            isDefault
        );
    }

    /// <summary>
    /// Updates the translation content.
    /// </summary>
    public void Update(
        string name,
        string? description,
        string? category,
        string? welcomeMessage,
        string? thankYouMessage,
        Guid? userId = null
    )
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Name is required.", nameof(name));

        Name = name.Trim();
        Description = description?.Trim();
        Category = category?.Trim();
        WelcomeMessage = welcomeMessage?.Trim();
        ThankYouMessage = thankYouMessage?.Trim();
        MarkAsModified(userId);
    }
}
