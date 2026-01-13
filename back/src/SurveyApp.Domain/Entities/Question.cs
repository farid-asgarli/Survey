using SurveyApp.Domain.Common;
using SurveyApp.Domain.Enums;
using SurveyApp.Domain.ValueObjects;

namespace SurveyApp.Domain.Entities;

/// <summary>
/// Represents a question in a survey.
/// All localizable content (Text, Description) is stored in the Translations collection.
/// </summary>
public class Question : Entity<Guid>, ILocalizable<QuestionTranslation>
{
    private readonly List<QuestionTranslation> _translations = [];

    /// <summary>
    /// Gets the survey ID this question belongs to.
    /// </summary>
    public Guid SurveyId { get; private set; }

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
    /// Gets the order of the question in the survey.
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
    /// Gets whether this question is an NPS (Net Promoter Score) question.
    /// </summary>
    public bool IsNpsQuestion { get; private set; }

    /// <summary>
    /// Gets the type of NPS question (Standard, CSAT, CES).
    /// Only applicable when IsNpsQuestion is true.
    /// </summary>
    public NpsQuestionType? NpsType { get; private set; }

    /// <summary>
    /// Gets the translations for this question.
    /// </summary>
    public IReadOnlyCollection<QuestionTranslation> Translations => _translations.AsReadOnly();

    /// <summary>
    /// Gets the default language for this question (inherited from survey, or first translation if detached).
    /// </summary>
    public string DefaultLanguage =>
        Survey?.DefaultLanguage ?? GetDefaultTranslation()?.LanguageCode ?? "en";

    /// <summary>
    /// Gets the survey navigation property.
    /// </summary>
    public Survey Survey { get; private set; } = null!;

    private Question() { }

    private Question(Guid id, Guid surveyId, QuestionType type, int order, bool isRequired)
        : base(id)
    {
        SurveyId = surveyId;
        Type = type;
        Order = order;
        IsRequired = isRequired;
        SettingsJson = QuestionSettings.CreateDefault(type).ToJson();
    }

    /// <summary>
    /// Creates a new question with a default translation.
    /// </summary>
    /// <param name="surveyId">The survey ID.</param>
    /// <param name="text">The question text.</param>
    /// <param name="type">The question type.</param>
    /// <param name="order">The question order.</param>
    /// <param name="isRequired">Whether the question is required.</param>
    /// <param name="languageCode">The language code for the default translation.</param>
    /// <param name="description">Optional description.</param>
    public static Question Create(
        Guid surveyId,
        string text,
        QuestionType type,
        int order,
        bool isRequired = false,
        string languageCode = "en",
        string? description = null
    )
    {
        if (string.IsNullOrWhiteSpace(text))
            throw new DomainException("Domain.Question.TextEmpty");

        var question = new Question(Guid.NewGuid(), surveyId, type, order, isRequired);

        // Create the default translation
        question.AddOrUpdateTranslation(languageCode, text, description);

        return question;
    }

    /// <summary>
    /// Updates the question text in the specified language (or default language).
    /// </summary>
    public void UpdateText(string text, string? languageCode = null)
    {
        if (string.IsNullOrWhiteSpace(text))
            throw new DomainException("Domain.Question.TextEmpty");

        var lang = languageCode ?? DefaultLanguage;
        var translation = GetTranslation(lang);

        if (translation == null)
        {
            AddOrUpdateTranslation(lang, text);
        }
        else
        {
            translation.Update(text, translation.Description, translation.GetTranslatedSettings());
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
            throw new DomainException("Domain.Question.OrderMinimum");

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
    /// Updates the question description in the specified language (or default language).
    /// </summary>
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

    /// <summary>
    /// Gets the question settings.
    /// </summary>
    public QuestionSettings GetSettings()
    {
        return string.IsNullOrWhiteSpace(SettingsJson)
            ? QuestionSettings.CreateDefault(Type)
            : QuestionSettings.FromJson(SettingsJson);
    }

    /// <summary>
    /// Marks this question as an NPS question.
    /// </summary>
    /// <param name="npsType">The type of NPS question.</param>
    public void SetAsNpsQuestion(NpsQuestionType npsType = NpsQuestionType.Standard)
    {
        IsNpsQuestion = true;
        NpsType = npsType;

        // Ensure the question type is compatible with NPS
        if (Type != QuestionType.NPS && Type != QuestionType.Scale && Type != QuestionType.Rating)
        {
            Type = QuestionType.NPS;
            SettingsJson = QuestionSettings.CreateDefault(QuestionType.NPS).ToJson();
        }
    }

    /// <summary>
    /// Removes the NPS designation from this question.
    /// </summary>
    public void RemoveNpsDesignation()
    {
        IsNpsQuestion = false;
        NpsType = null;
    }

    #region Localization Methods

    // TranslationManager handles common translation operations
    private TranslationManager<QuestionTranslation>? _translationManager;

    private TranslationManager<QuestionTranslation> TranslationHelper =>
        _translationManager ??= new TranslationManager<QuestionTranslation>(
            _translations,
            _ => { } // Question inherits DefaultLanguage from Survey, no-op here
        );

    /// <summary>
    /// Adds or updates a translation for this question.
    /// </summary>
    public QuestionTranslation AddOrUpdateTranslation(
        string languageCode,
        string text,
        string? description = null,
        TranslatedQuestionSettings? translatedSettings = null
    )
    {
        var existingTranslation = TranslationHelper.Find(languageCode);

        if (existingTranslation != null)
        {
            existingTranslation.Update(text, description, translatedSettings);
            return existingTranslation;
        }

        var isDefault = TranslationHelper.Count == 0;
        var translation = QuestionTranslation.Create(
            Id,
            languageCode,
            text,
            description,
            translatedSettings,
            isDefault
        );

        _translations.Add(translation);

        return translation;
    }

    /// <summary>
    /// Removes a translation from this question.
    /// </summary>
    public void RemoveTranslation(string languageCode) => TranslationHelper.Remove(languageCode);

    /// <summary>
    /// Gets a translation for the specified language, falling back to default if not found.
    /// </summary>
    public QuestionTranslation? GetTranslation(string? languageCode) =>
        TranslationHelper.Get(languageCode);

    /// <summary>
    /// Gets the default translation for this question.
    /// </summary>
    public QuestionTranslation? GetDefaultTranslation() => TranslationHelper.GetDefault();

    /// <summary>
    /// Gets the translated text for the specified language.
    /// </summary>
    public string GetLocalizedText(string? languageCode = null) =>
        GetTranslation(languageCode)?.Text ?? string.Empty;

    /// <summary>
    /// Gets the translated description for the specified language.
    /// </summary>
    public string? GetLocalizedDescription(string? languageCode = null) =>
        GetTranslation(languageCode)?.Description;

    /// <summary>
    /// Gets the translated settings merged with the base settings.
    /// </summary>
    public QuestionSettings GetLocalizedSettings(string? languageCode)
    {
        var baseSettings = GetSettings();
        var translation = GetTranslation(languageCode);
        var translatedSettings = translation?.GetTranslatedSettings();

        if (translatedSettings == null)
            return baseSettings;

        // Merge translated settings with base settings
        return baseSettings.WithTranslations(translatedSettings);
    }

    #endregion
}
