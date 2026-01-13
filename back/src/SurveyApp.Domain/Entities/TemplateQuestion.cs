using SurveyApp.Domain.Common;
using SurveyApp.Domain.Enums;
using SurveyApp.Domain.ValueObjects;

namespace SurveyApp.Domain.Entities;

/// <summary>
/// Represents a question in a survey template.
/// All localizable content (Text, Description) is stored in the Translations collection.
/// </summary>
public class TemplateQuestion : Entity<Guid>, ILocalizable<TemplateQuestionTranslation>
{
    private readonly List<TemplateQuestionTranslation> _translations = [];
    private TranslationManager<TemplateQuestionTranslation>? _translationManager;

    /// <summary>
    /// Gets the translation helper for managing translations.
    /// </summary>
    private TranslationManager<TemplateQuestionTranslation> TranslationHelper =>
        _translationManager ??= new TranslationManager<TemplateQuestionTranslation>(
            _translations,
            _ => { } // DefaultLanguage is inherited from Template, no-op callback
        );

    /// <summary>
    /// Gets the template ID this question belongs to.
    /// </summary>
    public Guid TemplateId { get; private set; }

    /// <summary>
    /// Gets the default language code inherited from the parent template.
    /// Falls back to default translation's language if template is not loaded,
    /// or "en" as ultimate fallback.
    /// </summary>
    public string DefaultLanguage =>
        Template?.DefaultLanguage ?? GetDefaultTranslation()?.LanguageCode ?? "en";

    /// <summary>
    /// Gets the translations for this question.
    /// </summary>
    public IReadOnlyCollection<TemplateQuestionTranslation> Translations =>
        _translations.AsReadOnly();

    #region Localized Content Properties (resolved from default translation)

    /// <summary>
    /// Gets the text of the question from the default translation.
    /// </summary>
    public string Text => GetDefaultTranslation()?.Text ?? string.Empty;

    /// <summary>
    /// Gets the description/help text from the default translation.
    /// </summary>
    public string? Description => GetDefaultTranslation()?.Description;

    #endregion

    /// <summary>
    /// Gets the type of the question.
    /// </summary>
    public QuestionType Type { get; private set; }

    /// <summary>
    /// Gets the order of the question in the template.
    /// </summary>
    public int Order { get; private set; }

    /// <summary>
    /// Gets whether the question is required.
    /// </summary>
    public bool IsRequired { get; private set; }

    /// <summary>
    /// Gets the settings for the question as JSON.
    /// </summary>
    public string? SettingsJson { get; private set; }

    /// <summary>
    /// Gets the template navigation property.
    /// </summary>
    public SurveyTemplate Template { get; private set; } = null!;

    private TemplateQuestion() { }

    private TemplateQuestion(
        Guid id,
        Guid templateId,
        QuestionType type,
        int order,
        bool isRequired,
        string? settingsJson
    )
        : base(id)
    {
        TemplateId = templateId;
        Type = type;
        Order = order;
        IsRequired = isRequired;
        SettingsJson = settingsJson ?? QuestionSettings.CreateDefault(type).ToJson();
    }

    /// <summary>
    /// Creates a new template question with a default translation.
    /// </summary>
    /// <param name="templateId">The template ID.</param>
    /// <param name="text">The question text.</param>
    /// <param name="type">The question type.</param>
    /// <param name="order">The question order.</param>
    /// <param name="isRequired">Whether the question is required.</param>
    /// <param name="languageCode">The language code for the default translation (defaults to "en").</param>
    /// <param name="description">Optional description.</param>
    /// <param name="settingsJson">Optional settings JSON.</param>
    public static TemplateQuestion Create(
        Guid templateId,
        string text,
        QuestionType type,
        int order,
        bool isRequired = false,
        string languageCode = "en",
        string? description = null,
        string? settingsJson = null
    )
    {
        if (string.IsNullOrWhiteSpace(text))
            throw new DomainException("Domain.TemplateQuestion.TextEmpty");

        var question = new TemplateQuestion(
            Guid.NewGuid(),
            templateId,
            type,
            order,
            isRequired,
            settingsJson
        );

        // Create the default translation with the provided content
        var translation = TemplateQuestionTranslation.Create(
            question.Id,
            languageCode,
            text,
            description,
            null, // translatedSettings
            isDefault: true
        );

        question._translations.Add(translation);
        // Note: DefaultLanguage is now inherited from Template, not stored on Question

        return question;
    }

    #region Localization Methods

    /// <summary>
    /// Gets the default translation.
    /// </summary>
    public TemplateQuestionTranslation? GetDefaultTranslation() => TranslationHelper.GetDefault();

    /// <summary>
    /// Gets a translation for the specified language, falling back to default if not found.
    /// </summary>
    public TemplateQuestionTranslation? GetTranslation(string? languageCode) =>
        TranslationHelper.Get(languageCode);

    /// <summary>
    /// Removes a translation from the question.
    /// </summary>
    public void RemoveTranslation(string languageCode) => TranslationHelper.Remove(languageCode);

    /// <summary>
    /// Sets a translation as the default.
    /// </summary>
    public void SetDefaultTranslation(string languageCode) =>
        TranslationHelper.SetDefault(languageCode);

    /// <summary>
    /// Gets all available language codes.
    /// </summary>
    public IReadOnlyList<string> GetAvailableLanguages() =>
        TranslationHelper.GetAvailableLanguages();

    /// <summary>
    /// Adds or updates a translation for the question.
    /// </summary>
    public void AddOrUpdateTranslation(
        string languageCode,
        string text,
        string? description = null,
        TranslatedQuestionSettings? translatedSettings = null
    )
    {
        if (string.IsNullOrWhiteSpace(languageCode))
            throw new DomainException("Domain.TemplateQuestion.LanguageCodeRequired");

        if (string.IsNullOrWhiteSpace(text))
            throw new DomainException("Domain.TemplateQuestion.TextRequired");

        var existing = TranslationHelper.Find(languageCode);
        if (existing != null)
        {
            existing.Update(text, description, translatedSettings);
        }
        else
        {
            var translation = TemplateQuestionTranslation.Create(
                Id,
                languageCode,
                text,
                description,
                translatedSettings,
                isDefault: false
            );
            TranslationHelper.Add(translation);
        }
    }

    /// <summary>
    /// Gets the localized text for the specified language.
    /// </summary>
    public string GetLocalizedText(string? languageCode = null) =>
        GetTranslation(languageCode)?.Text ?? string.Empty;

    /// <summary>
    /// Gets the localized description for the specified language.
    /// </summary>
    public string? GetLocalizedDescription(string? languageCode = null) =>
        GetTranslation(languageCode)?.Description;

    /// <summary>
    /// Gets the translated settings for the specified language.
    /// </summary>
    public TranslatedQuestionSettings? GetLocalizedSettings(string? languageCode = null) =>
        GetTranslation(languageCode)?.GetTranslatedSettings();

    #endregion

    #region Mutation Methods

    /// <summary>
    /// Updates the question text for the specified language.
    /// </summary>
    /// <param name="text">The new text.</param>
    /// <param name="languageCode">The language code (defaults to default language).</param>
    public void UpdateText(string text, string? languageCode = null)
    {
        if (string.IsNullOrWhiteSpace(text))
            throw new DomainException("Domain.TemplateQuestion.TextEmpty");

        var lang = languageCode ?? DefaultLanguage;
        var translation = GetTranslation(lang);
        if (translation != null)
        {
            translation.Update(text, translation.Description, translation.GetTranslatedSettings());
        }
        else
        {
            AddOrUpdateTranslation(lang, text);
        }
    }

    /// <summary>
    /// Updates the question type.
    /// </summary>
    public void UpdateType(QuestionType type)
    {
        Type = type;
        SettingsJson = QuestionSettings.CreateDefault(type).ToJson();
    }

    /// <summary>
    /// Updates the question order.
    /// </summary>
    public void UpdateOrder(int order)
    {
        if (order < 1)
            throw new DomainException("Domain.TemplateQuestion.OrderMinimum");

        Order = order;
    }

    /// <summary>
    /// Updates whether the question is required.
    /// </summary>
    public void UpdateRequired(bool isRequired)
    {
        IsRequired = isRequired;
    }

    /// <summary>
    /// Updates the question description for the specified language.
    /// </summary>
    /// <param name="description">The new description.</param>
    /// <param name="languageCode">The language code (defaults to default language).</param>
    public void UpdateDescription(string? description, string? languageCode = null)
    {
        var lang = languageCode ?? DefaultLanguage;
        var translation = GetTranslation(lang);
        translation?.Update(translation.Text, description, translation.GetTranslatedSettings());
    }

    /// <summary>
    /// Updates the question settings.
    /// </summary>
    public void UpdateSettings(QuestionSettings settings)
    {
        SettingsJson = settings.ToJson();
    }

    #endregion

    /// <summary>
    /// Gets the question settings.
    /// </summary>
    public QuestionSettings GetSettings()
    {
        return string.IsNullOrWhiteSpace(SettingsJson)
            ? QuestionSettings.CreateDefault(Type)
            : QuestionSettings.FromJson(SettingsJson);
    }
}
