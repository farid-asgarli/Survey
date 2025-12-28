using SurveyApp.Domain.Common;
using SurveyApp.Domain.ValueObjects;

namespace SurveyApp.Domain.Entities;

/// <summary>
/// Represents a translation for a TemplateQuestion entity.
/// </summary>
public class TemplateQuestionTranslation : Translation
{
    /// <summary>
    /// Gets the ID of the template question this translation belongs to.
    /// </summary>
    public Guid TemplateQuestionId { get; private set; }

    /// <summary>
    /// Gets the translated text of the question.
    /// </summary>
    public string Text { get; private set; } = null!;

    /// <summary>
    /// Gets the translated description/help text for the question.
    /// </summary>
    public string? Description { get; private set; }

    /// <summary>
    /// Gets the translated question settings as JSON.
    /// Contains translated options, labels, matrix rows/columns, etc.
    /// </summary>
    public string? TranslatedSettingsJson { get; private set; }

    /// <summary>
    /// Navigation property to the parent template question.
    /// </summary>
    public TemplateQuestion TemplateQuestion { get; private set; } = null!;

    private TemplateQuestionTranslation() { }

    private TemplateQuestionTranslation(
        Guid id,
        Guid templateQuestionId,
        string languageCode,
        string text,
        string? description,
        string? translatedSettingsJson,
        bool isDefault
    )
        : base(id, languageCode, isDefault)
    {
        TemplateQuestionId = templateQuestionId;
        Text = text;
        Description = description;
        TranslatedSettingsJson = translatedSettingsJson;
    }

    /// <summary>
    /// Creates a new template question translation.
    /// </summary>
    public static TemplateQuestionTranslation Create(
        Guid templateQuestionId,
        string languageCode,
        string text,
        string? description = null,
        TranslatedQuestionSettings? translatedSettings = null,
        bool isDefault = false
    )
    {
        if (string.IsNullOrWhiteSpace(languageCode))
            throw new ArgumentException("Language code is required.", nameof(languageCode));

        if (string.IsNullOrWhiteSpace(text))
            throw new ArgumentException("Question text is required.", nameof(text));

        return new TemplateQuestionTranslation(
            Guid.NewGuid(),
            templateQuestionId,
            languageCode.ToLowerInvariant(),
            text.Trim(),
            description?.Trim(),
            translatedSettings?.ToJson(),
            isDefault
        );
    }

    /// <summary>
    /// Updates the translation content.
    /// </summary>
    public void Update(
        string text,
        string? description,
        TranslatedQuestionSettings? translatedSettings,
        Guid? userId = null
    )
    {
        if (string.IsNullOrWhiteSpace(text))
            throw new ArgumentException("Question text is required.", nameof(text));

        Text = text.Trim();
        Description = description?.Trim();
        TranslatedSettingsJson = translatedSettings?.ToJson();
        MarkAsModified(userId);
    }

    /// <summary>
    /// Gets the translated settings as a strongly-typed object.
    /// </summary>
    public TranslatedQuestionSettings? GetTranslatedSettings()
    {
        return TranslatedQuestionSettings.FromJson(TranslatedSettingsJson);
    }
}
