using SurveyApp.Domain.Common;
using SurveyApp.Domain.Enums;

namespace SurveyApp.Domain.Entities;

/// <summary>
/// Represents a reusable survey template.
/// All localizable content (Name, Description, Category, WelcomeMessage, ThankYouMessage)
/// is stored in the Translations collection.
/// </summary>
public class SurveyTemplate : AggregateRoot<Guid>, ILocalizable<SurveyTemplateTranslation>
{
    private readonly List<TemplateQuestion> _questions = [];
    private readonly List<SurveyTemplateTranslation> _translations = [];
    private TranslationManager<SurveyTemplateTranslation>? _translationManager;

    /// <summary>
    /// Gets the translation helper for managing translations.
    /// </summary>
    private TranslationManager<SurveyTemplateTranslation> TranslationHelper =>
        _translationManager ??= new TranslationManager<SurveyTemplateTranslation>(
            _translations,
            lang => DefaultLanguage = lang
        );

    /// <summary>
    /// Gets the namespace ID this template belongs to.
    /// </summary>
    public Guid NamespaceId { get; private set; }

    /// <summary>
    /// Gets the default language code (ISO 639-1) for this template.
    /// </summary>
    public string DefaultLanguage { get; private set; } = "en";

    /// <summary>
    /// Gets the translations for this template.
    /// </summary>
    public IReadOnlyCollection<SurveyTemplateTranslation> Translations =>
        _translations.AsReadOnly();

    #region Localized Content Properties (resolved from default translation)

    /// <summary>
    /// Gets the name of the template from the default translation.
    /// </summary>
    public string Name => GetDefaultTranslation()?.Name ?? string.Empty;

    /// <summary>
    /// Gets the description of the template from the default translation.
    /// </summary>
    public string? Description => GetDefaultTranslation()?.Description;

    /// <summary>
    /// Gets the category of the template from the default translation.
    /// </summary>
    public string? Category => GetDefaultTranslation()?.Category;

    /// <summary>
    /// Gets the welcome message from the default translation.
    /// </summary>
    public string? WelcomeMessage => GetDefaultTranslation()?.WelcomeMessage;

    /// <summary>
    /// Gets the thank you message from the default translation.
    /// </summary>
    public string? ThankYouMessage => GetDefaultTranslation()?.ThankYouMessage;

    #endregion

    /// <summary>
    /// Gets whether the template is publicly available within the namespace.
    /// </summary>
    public bool IsPublic { get; private set; }

    /// <summary>
    /// Gets the default settings for anonymous responses.
    /// </summary>
    public bool DefaultAllowAnonymous { get; private set; }

    /// <summary>
    /// Gets the default settings for multiple responses.
    /// </summary>
    public bool DefaultAllowMultipleResponses { get; private set; }

    /// <summary>
    /// Gets the number of times this template has been used.
    /// </summary>
    public int UsageCount { get; private set; }

    /// <summary>
    /// Gets the questions in the template.
    /// </summary>
    public IReadOnlyCollection<TemplateQuestion> Questions => _questions.AsReadOnly();

    /// <summary>
    /// Gets the namespace navigation property.
    /// </summary>
    public Namespace Namespace { get; private set; } = null!;

    private SurveyTemplate() { }

    private SurveyTemplate(Guid id, Guid namespaceId, Guid createdBy)
        : base(id)
    {
        NamespaceId = namespaceId;
        IsPublic = false;
        DefaultAllowAnonymous = true;
        DefaultAllowMultipleResponses = false;
        UsageCount = 0;
        CreatedBy = createdBy;
    }

    /// <summary>
    /// Creates a new survey template with a default translation.
    /// </summary>
    /// <param name="namespaceId">The namespace ID.</param>
    /// <param name="name">The template name.</param>
    /// <param name="createdBy">The user who created the template.</param>
    /// <param name="languageCode">The language code for the default translation (defaults to "en").</param>
    /// <param name="description">Optional description.</param>
    /// <param name="category">Optional category.</param>
    /// <param name="welcomeMessage">Optional welcome message.</param>
    /// <param name="thankYouMessage">Optional thank you message.</param>
    public static SurveyTemplate Create(
        Guid namespaceId,
        string name,
        Guid createdBy,
        string languageCode = "en",
        string? description = null,
        string? category = null,
        string? welcomeMessage = null,
        string? thankYouMessage = null
    )
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Template name cannot be empty.", nameof(name));

        var template = new SurveyTemplate(Guid.NewGuid(), namespaceId, createdBy);

        // Create the default translation with the provided content
        var translation = SurveyTemplateTranslation.Create(
            template.Id,
            languageCode,
            name,
            description,
            category,
            welcomeMessage,
            thankYouMessage,
            isDefault: true
        );

        template._translations.Add(translation);
        template.DefaultLanguage = languageCode.ToLowerInvariant();

        return template;
    }

    /// <summary>
    /// Creates a template from an existing survey.
    /// </summary>
    /// <param name="survey">The survey to create the template from.</param>
    /// <param name="templateName">The name for the template.</param>
    /// <param name="createdBy">The user who created the template.</param>
    /// <param name="languageCode">The language code for the template (defaults to survey's default language).</param>
    public static SurveyTemplate CreateFromSurvey(
        Survey survey,
        string templateName,
        Guid createdBy,
        string? languageCode = null
    )
    {
        if (string.IsNullOrWhiteSpace(templateName))
            throw new ArgumentException("Template name cannot be empty.", nameof(templateName));

        var lang = languageCode ?? survey.DefaultLanguage;

        var template = Create(
            survey.NamespaceId,
            templateName,
            createdBy,
            lang,
            survey.GetLocalizedDescription(lang),
            null, // category not from survey
            survey.GetLocalizedWelcomeMessage(lang),
            survey.GetLocalizedThankYouMessage(lang)
        );

        template.DefaultAllowAnonymous = survey.AllowAnonymousResponses;
        template.DefaultAllowMultipleResponses = survey.AllowMultipleResponses;

        // Copy questions
        foreach (var question in survey.Questions.OrderBy(q => q.Order))
        {
            template.AddQuestion(
                question.Text,
                question.Type,
                question.IsRequired,
                question.Description,
                question.SettingsJson
            );
        }

        return template;
    }

    #region Localization Methods

    /// <summary>
    /// Gets the default translation.
    /// </summary>
    public SurveyTemplateTranslation? GetDefaultTranslation() => TranslationHelper.GetDefault();

    /// <summary>
    /// Gets a translation for the specified language, falling back to default if not found.
    /// </summary>
    public SurveyTemplateTranslation? GetTranslation(string? languageCode) =>
        TranslationHelper.Get(languageCode);

    /// <summary>
    /// Removes a translation from the template.
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
    /// Adds or updates a translation for the template.
    /// </summary>
    public void AddOrUpdateTranslation(
        string languageCode,
        string name,
        string? description = null,
        string? category = null,
        string? welcomeMessage = null,
        string? thankYouMessage = null
    )
    {
        if (string.IsNullOrWhiteSpace(languageCode))
            throw new ArgumentException("Language code is required.", nameof(languageCode));

        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Name is required.", nameof(name));

        var existing = TranslationHelper.Find(languageCode);
        if (existing != null)
        {
            existing.Update(name, description, category, welcomeMessage, thankYouMessage);
        }
        else
        {
            var translation = SurveyTemplateTranslation.Create(
                Id,
                languageCode,
                name,
                description,
                category,
                welcomeMessage,
                thankYouMessage,
                isDefault: false
            );
            TranslationHelper.Add(translation);
        }
    }

    /// <summary>
    /// Gets the localized name for the specified language.
    /// </summary>
    public string GetLocalizedName(string? languageCode = null) =>
        GetTranslation(languageCode)?.Name ?? string.Empty;

    /// <summary>
    /// Gets the localized description for the specified language.
    /// </summary>
    public string? GetLocalizedDescription(string? languageCode = null) =>
        GetTranslation(languageCode)?.Description;

    /// <summary>
    /// Gets the localized category for the specified language.
    /// </summary>
    public string? GetLocalizedCategory(string? languageCode = null) =>
        GetTranslation(languageCode)?.Category;

    /// <summary>
    /// Gets the localized welcome message for the specified language.
    /// </summary>
    public string? GetLocalizedWelcomeMessage(string? languageCode = null) =>
        GetTranslation(languageCode)?.WelcomeMessage;

    /// <summary>
    /// Gets the localized thank you message for the specified language.
    /// </summary>
    public string? GetLocalizedThankYouMessage(string? languageCode = null) =>
        GetTranslation(languageCode)?.ThankYouMessage;

    #endregion

    #region Mutation Methods

    /// <summary>
    /// Updates the template name for the specified language.
    /// </summary>
    /// <param name="name">The new name.</param>
    /// <param name="languageCode">The language code (defaults to default language).</param>
    public void UpdateName(string name, string? languageCode = null)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Template name cannot be empty.", nameof(name));

        var lang = languageCode ?? DefaultLanguage;
        var translation = GetTranslation(lang);
        if (translation != null)
        {
            translation.Update(
                name,
                translation.Description,
                translation.Category,
                translation.WelcomeMessage,
                translation.ThankYouMessage
            );
        }
        else
        {
            AddOrUpdateTranslation(lang, name);
        }
    }

    /// <summary>
    /// Updates the template description for the specified language.
    /// </summary>
    /// <param name="description">The new description.</param>
    /// <param name="languageCode">The language code (defaults to default language).</param>
    public void UpdateDescription(string? description, string? languageCode = null)
    {
        var lang = languageCode ?? DefaultLanguage;
        var translation = GetTranslation(lang);
        if (translation != null)
        {
            translation.Update(
                translation.Name,
                description,
                translation.Category,
                translation.WelcomeMessage,
                translation.ThankYouMessage
            );
        }
    }

    /// <summary>
    /// Updates the template category for the specified language.
    /// </summary>
    /// <param name="category">The new category.</param>
    /// <param name="languageCode">The language code (defaults to default language).</param>
    public void UpdateCategory(string? category, string? languageCode = null)
    {
        var lang = languageCode ?? DefaultLanguage;
        var translation = GetTranslation(lang);
        if (translation != null)
        {
            translation.Update(
                translation.Name,
                translation.Description,
                category,
                translation.WelcomeMessage,
                translation.ThankYouMessage
            );
        }
    }

    /// <summary>
    /// Sets the template visibility.
    /// </summary>
    public void SetPublic(bool isPublic)
    {
        IsPublic = isPublic;
    }

    /// <summary>
    /// Sets the welcome message for the specified language.
    /// </summary>
    /// <param name="message">The welcome message.</param>
    /// <param name="languageCode">The language code (defaults to default language).</param>
    public void SetWelcomeMessage(string? message, string? languageCode = null)
    {
        var lang = languageCode ?? DefaultLanguage;
        var translation = GetTranslation(lang);
        if (translation != null)
        {
            translation.Update(
                translation.Name,
                translation.Description,
                translation.Category,
                message,
                translation.ThankYouMessage
            );
        }
    }

    /// <summary>
    /// Sets the thank you message for the specified language.
    /// </summary>
    /// <param name="message">The thank you message.</param>
    /// <param name="languageCode">The language code (defaults to default language).</param>
    public void SetThankYouMessage(string? message, string? languageCode = null)
    {
        var lang = languageCode ?? DefaultLanguage;
        var translation = GetTranslation(lang);
        if (translation != null)
        {
            translation.Update(
                translation.Name,
                translation.Description,
                translation.Category,
                translation.WelcomeMessage,
                message
            );
        }
    }

    /// <summary>
    /// Configures default response settings.
    /// </summary>
    public void ConfigureDefaults(bool allowAnonymous, bool allowMultipleResponses)
    {
        DefaultAllowAnonymous = allowAnonymous;
        DefaultAllowMultipleResponses = allowMultipleResponses;
    }

    #endregion

    /// <summary>
    /// Adds a question to the template.
    /// </summary>
    /// <param name="text">The question text.</param>
    /// <param name="type">The question type.</param>
    /// <param name="isRequired">Whether the question is required.</param>
    /// <param name="description">Optional description.</param>
    /// <param name="settingsJson">Optional settings JSON.</param>
    /// <param name="languageCode">The language code for the question (defaults to template's default language).</param>
    public TemplateQuestion AddQuestion(
        string text,
        QuestionType type,
        bool isRequired = false,
        string? description = null,
        string? settingsJson = null,
        string? languageCode = null
    )
    {
        var order = _questions.Count + 1;
        var lang = languageCode ?? DefaultLanguage;
        var question = TemplateQuestion.Create(
            Id,
            text,
            type,
            order,
            isRequired,
            lang,
            description,
            settingsJson
        );
        _questions.Add(question);
        return question;
    }

    /// <summary>
    /// Removes a question from the template.
    /// </summary>
    public void RemoveQuestion(Guid questionId)
    {
        var question = _questions.FirstOrDefault(q => q.Id == questionId);
        if (question == null)
            throw new InvalidOperationException("Question not found in template.");

        _questions.Remove(question);
        ReorderQuestions();
    }

    /// <summary>
    /// Reorders a question in the template.
    /// </summary>
    public void ReorderQuestion(Guid questionId, int newOrder)
    {
        var question = _questions.FirstOrDefault(q => q.Id == questionId);
        if (question == null)
            throw new InvalidOperationException("Question not found in template.");

        if (newOrder < 1 || newOrder > _questions.Count)
            throw new ArgumentOutOfRangeException(
                nameof(newOrder),
                "Order must be between 1 and the number of questions."
            );

        var currentOrder = question.Order;
        if (currentOrder == newOrder)
            return;

        foreach (var q in _questions)
        {
            if (currentOrder < newOrder)
            {
                // Moving down
                if (q.Order > currentOrder && q.Order <= newOrder)
                    q.UpdateOrder(q.Order - 1);
            }
            else
            {
                // Moving up
                if (q.Order >= newOrder && q.Order < currentOrder)
                    q.UpdateOrder(q.Order + 1);
            }
        }

        question.UpdateOrder(newOrder);
    }

    /// <summary>
    /// Increments the usage count when a survey is created from this template.
    /// </summary>
    public void IncrementUsageCount()
    {
        UsageCount++;
    }

    /// <summary>
    /// Creates a survey from this template.
    /// </summary>
    /// <param name="title">The survey title.</param>
    /// <param name="createdBy">The user creating the survey.</param>
    /// <param name="languageCode">The language code for the survey (defaults to template's default language).</param>
    public Survey CreateSurvey(string title, Guid createdBy, string? languageCode = null)
    {
        var lang = languageCode ?? DefaultLanguage;

        var survey = Survey.Create(
            NamespaceId,
            title,
            createdBy,
            lang,
            GetLocalizedDescription(lang),
            GetLocalizedWelcomeMessage(lang),
            GetLocalizedThankYouMessage(lang)
        );

        survey.SetAnonymous(DefaultAllowAnonymous);
        survey.ConfigureResponseSettings(
            DefaultAllowAnonymous,
            DefaultAllowMultipleResponses,
            null
        );

        // Add questions from template
        foreach (var templateQuestion in _questions.OrderBy(q => q.Order))
        {
            var question = survey.AddQuestion(
                templateQuestion.GetLocalizedText(lang),
                templateQuestion.Type,
                templateQuestion.IsRequired,
                lang
            );

            var desc = templateQuestion.GetLocalizedDescription(lang);
            if (!string.IsNullOrEmpty(desc))
                question.UpdateDescription(desc, lang);

            if (!string.IsNullOrEmpty(templateQuestion.SettingsJson))
            {
                var settings = Domain.ValueObjects.QuestionSettings.FromJson(
                    templateQuestion.SettingsJson
                );
                question.UpdateSettings(settings);
            }
        }

        IncrementUsageCount();

        return survey;
    }

    private void ReorderQuestions()
    {
        var orderedQuestions = _questions.OrderBy(q => q.Order).ToList();
        for (int i = 0; i < orderedQuestions.Count; i++)
        {
            orderedQuestions[i].UpdateOrder(i + 1);
        }
    }
}
