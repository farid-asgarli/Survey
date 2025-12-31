using SurveyApp.Domain.Common;
using SurveyApp.Domain.Enums;
using SurveyApp.Domain.Events;

namespace SurveyApp.Domain.Entities;

/// <summary>
/// Represents a survey in the system.
/// All localizable content (Title, Description, WelcomeMessage, ThankYouMessage)
/// is stored in the Translations collection.
/// </summary>
public class Survey : AggregateRoot<Guid>, ILocalizable<SurveyTranslation>
{
    private readonly List<Question> _questions = [];
    private readonly List<SurveyResponse> _responses = [];
    private readonly List<SurveyTranslation> _translations = [];

    /// <summary>
    /// Gets the namespace ID this survey belongs to.
    /// </summary>
    public Guid NamespaceId { get; private set; }

    /// <summary>
    /// Gets the type/category of the survey.
    /// </summary>
    public SurveyType Type { get; private set; }

    /// <summary>
    /// Gets the Customer Experience metric type (only applicable when Type is CustomerExperience).
    /// </summary>
    public CxMetricType? CxMetricType { get; private set; }

    /// <summary>
    /// Gets the status of the survey.
    /// </summary>
    public SurveyStatus Status { get; private set; }

    #region Localized Content Properties (resolved from default translation)

    /// <summary>
    /// Gets the title of the survey from the default translation.
    /// </summary>
    public string Title => GetDefaultTranslation()?.Title ?? string.Empty;

    /// <summary>
    /// Gets the description of the survey from the default translation.
    /// </summary>
    public string? Description => GetDefaultTranslation()?.Description;

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
    /// Gets the unique access token for public survey access.
    /// </summary>
    public string AccessToken { get; private set; } = null!;

    /// <summary>
    /// Gets the date and time when the survey was published.
    /// </summary>
    public DateTime? PublishedAt { get; private set; }

    /// <summary>
    /// Gets the date and time when the survey was closed.
    /// </summary>
    public DateTime? ClosedAt { get; private set; }

    /// <summary>
    /// Gets the scheduled start date for the survey.
    /// </summary>
    public DateTime? StartsAt { get; private set; }

    /// <summary>
    /// Gets the scheduled end date for the survey.
    /// </summary>
    public DateTime? EndsAt { get; private set; }

    /// <summary>
    /// Gets whether the survey allows anonymous responses.
    /// </summary>
    public bool AllowAnonymousResponses { get; private set; }

    /// <summary>
    /// Gets whether the survey allows multiple responses from the same respondent.
    /// </summary>
    public bool AllowMultipleResponses { get; private set; }

    /// <summary>
    /// Gets the maximum number of responses allowed (null for unlimited).
    /// </summary>
    public int? MaxResponses { get; private set; }

    /// <summary>
    /// Gets the saved theme ID applied to this survey (for custom themes).
    /// </summary>
    public Guid? ThemeId { get; private set; }

    /// <summary>
    /// Gets the preset theme identifier (e.g., "midnight", "ocean") for preset themes.
    /// </summary>
    public string? PresetThemeId { get; private set; }

    /// <summary>
    /// Gets the theme navigation property.
    /// </summary>
    public SurveyTheme? Theme { get; private set; }

    /// <summary>
    /// Gets the theme customizations JSON (optional per-survey overrides).
    /// </summary>
    public string? ThemeCustomizations { get; private set; }

    /// <summary>
    /// Gets the default language code for this survey (ISO 639-1).
    /// </summary>
    public string DefaultLanguage { get; private set; } = "en";

    /// <summary>
    /// Gets the translations for this survey.
    /// </summary>
    public IReadOnlyCollection<SurveyTranslation> Translations => _translations.AsReadOnly();

    /// <summary>
    /// Gets whether the survey is currently accepting responses.
    /// </summary>
    public bool IsAcceptingResponses => CanAcceptResponses;

    /// <summary>
    /// Gets whether the survey is anonymous (alias for AllowAnonymousResponses).
    /// </summary>
    public bool IsAnonymous => AllowAnonymousResponses;

    /// <summary>
    /// Gets whether the survey can accept responses.
    /// </summary>
    public bool CanAcceptResponses
    {
        get
        {
            if (Status != SurveyStatus.Published)
                return false;

            if (MaxResponses.HasValue && _responses.Count >= MaxResponses.Value)
                return false;

            var now = DateTime.UtcNow;
            if (StartsAt.HasValue && now < StartsAt.Value)
                return false;

            if (EndsAt.HasValue && now > EndsAt.Value)
                return false;

            return true;
        }
    }

    /// <summary>
    /// Gets the questions in the survey.
    /// </summary>
    public IReadOnlyCollection<Question> Questions => _questions.AsReadOnly();

    /// <summary>
    /// Gets the responses to the survey.
    /// </summary>
    public IReadOnlyCollection<SurveyResponse> Responses => _responses.AsReadOnly();

    /// <summary>
    /// Gets the namespace navigation property.
    /// </summary>
    public Namespace Namespace { get; private set; } = null!;

    private Survey() { }

    private Survey(Guid id, Guid namespaceId, Guid createdBy)
        : base(id)
    {
        NamespaceId = namespaceId;
        Type = SurveyType.Classic;
        Status = SurveyStatus.Draft;
        AccessToken = GenerateAccessToken();
        AllowAnonymousResponses = true;
        AllowMultipleResponses = false;
        CreatedBy = createdBy;
    }

    /// <summary>
    /// Creates a new survey with a default translation.
    /// </summary>
    /// <param name="namespaceId">The namespace ID.</param>
    /// <param name="title">The survey title.</param>
    /// <param name="createdBy">The user who created the survey.</param>
    /// <param name="languageCode">The default language code (ISO 639-1). Defaults to "en".</param>
    /// <param name="description">Optional description.</param>
    /// <param name="welcomeMessage">Optional welcome message.</param>
    /// <param name="thankYouMessage">Optional thank you message.</param>
    public static Survey Create(
        Guid namespaceId,
        string title,
        Guid createdBy,
        string languageCode = "en",
        string? description = null,
        string? welcomeMessage = null,
        string? thankYouMessage = null
    )
    {
        if (string.IsNullOrWhiteSpace(title))
            throw new DomainException("Domain.Survey.SurveyTitleRequired");

        var survey = new Survey(Guid.NewGuid(), namespaceId, createdBy);
        survey.DefaultLanguage = languageCode.ToLowerInvariant();

        // Create the default translation
        survey.AddOrUpdateTranslation(
            languageCode,
            title,
            description,
            welcomeMessage,
            thankYouMessage
        );

        return survey;
    }

    /// <summary>
    /// Creates a new survey with a specific type and default translation.
    /// </summary>
    public static Survey Create(
        Guid namespaceId,
        string title,
        Guid createdBy,
        SurveyType type,
        CxMetricType? cxMetricType = null,
        string languageCode = "en",
        string? description = null,
        string? welcomeMessage = null,
        string? thankYouMessage = null
    )
    {
        if (string.IsNullOrWhiteSpace(title))
            throw new DomainException("Domain.Survey.SurveyTitleRequired");

        var survey = new Survey(Guid.NewGuid(), namespaceId, createdBy)
        {
            Type = type,
            CxMetricType = type == SurveyType.CustomerExperience ? cxMetricType : null,
            DefaultLanguage = languageCode.ToLowerInvariant(),
        };

        // Create the default translation
        survey.AddOrUpdateTranslation(
            languageCode,
            title,
            description,
            welcomeMessage,
            thankYouMessage
        );

        return survey;
    }

    /// <summary>
    /// Sets the survey type.
    /// </summary>
    public void SetType(SurveyType type, CxMetricType? cxMetricType = null)
    {
        Type = type;
        CxMetricType = type == SurveyType.CustomerExperience ? cxMetricType : null;
    }

    /// <summary>
    /// Updates the survey title in the specified language (or default language).
    /// </summary>
    public void UpdateTitle(string title, string? languageCode = null)
    {
        if (string.IsNullOrWhiteSpace(title))
            throw new DomainException("Domain.Survey.SurveyTitleRequired");

        var lang = languageCode ?? DefaultLanguage;
        var translation = GetTranslation(lang);

        if (translation == null)
        {
            AddOrUpdateTranslation(lang, title);
        }
        else
        {
            translation.Update(
                title,
                translation.Description,
                translation.WelcomeMessage,
                translation.ThankYouMessage
            );
        }
    }

    /// <summary>
    /// Updates the survey description in the specified language (or default language).
    /// </summary>
    public void UpdateDescription(string? description, string? languageCode = null)
    {
        var lang = languageCode ?? DefaultLanguage;
        var translation = GetTranslation(lang);

        if (translation != null)
        {
            translation.Update(
                translation.Title,
                description,
                translation.WelcomeMessage,
                translation.ThankYouMessage
            );
        }
    }

    /// <summary>
    /// Updates the welcome message in the specified language (or default language).
    /// </summary>
    public void UpdateWelcomeMessage(string? message, string? languageCode = null)
    {
        var lang = languageCode ?? DefaultLanguage;
        var translation = GetTranslation(lang);

        if (translation != null)
        {
            translation.Update(
                translation.Title,
                translation.Description,
                message,
                translation.ThankYouMessage
            );
        }
    }

    /// <summary>
    /// Updates the thank you message in the specified language (or default language).
    /// </summary>
    public void UpdateThankYouMessage(string? message, string? languageCode = null)
    {
        var lang = languageCode ?? DefaultLanguage;
        var translation = GetTranslation(lang);

        if (translation != null)
        {
            translation.Update(
                translation.Title,
                translation.Description,
                translation.WelcomeMessage,
                message
            );
        }
    }

    /// <summary>
    /// Updates the survey details (title and description) in the specified language.
    /// </summary>
    public void UpdateDetails(string title, string? description, string? languageCode = null)
    {
        if (string.IsNullOrWhiteSpace(title))
            throw new DomainException("Domain.Survey.SurveyTitleRequired");

        var lang = languageCode ?? DefaultLanguage;
        var translation = GetTranslation(lang);

        if (translation == null)
        {
            AddOrUpdateTranslation(lang, title, description);
        }
        else
        {
            translation.Update(
                title,
                description,
                translation.WelcomeMessage,
                translation.ThankYouMessage
            );
        }
    }

    /// <summary>
    /// Sets the welcome message in the default language.
    /// </summary>
    public void SetWelcomeMessage(string message)
    {
        UpdateWelcomeMessage(message);
    }

    /// <summary>
    /// Sets the thank you message in the default language.
    /// </summary>
    public void SetThankYouMessage(string message)
    {
        UpdateThankYouMessage(message);
    }

    /// <summary>
    /// Sets whether the survey is anonymous.
    /// </summary>
    public void SetAnonymous(bool isAnonymous)
    {
        AllowAnonymousResponses = isAnonymous;
    }

    /// <summary>
    /// Sets the maximum number of responses.
    /// </summary>
    public void SetMaxResponses(int maxResponses)
    {
        MaxResponses = maxResponses;
    }

    /// <summary>
    /// Sets the survey schedule.
    /// </summary>
    public void SetSchedule(DateTime? startsAt, DateTime? endsAt)
    {
        if (startsAt.HasValue && endsAt.HasValue && startsAt >= endsAt)
            throw new DomainException("Domain.Survey.StartDateBeforeEndDate");

        StartsAt = startsAt;
        EndsAt = endsAt;
    }

    /// <summary>
    /// Configures response settings.
    /// </summary>
    public void ConfigureResponseSettings(
        bool allowAnonymous,
        bool allowMultiple,
        int? maxResponses
    )
    {
        AllowAnonymousResponses = allowAnonymous;
        AllowMultipleResponses = allowMultiple;
        MaxResponses = maxResponses;
    }

    /// <summary>
    /// Adds a question to the survey.
    /// </summary>
    /// <param name="text">The question text.</param>
    /// <param name="type">The question type.</param>
    /// <param name="isRequired">Whether the question is required.</param>
    /// <param name="languageCode">The language code for the question. Defaults to survey's default language.</param>
    public Question AddQuestion(
        string text,
        QuestionType type,
        bool isRequired = false,
        string? languageCode = null
    )
    {
        EnsureDraft();

        var order = _questions.Count + 1;
        var lang = languageCode ?? DefaultLanguage;
        var question = Question.Create(Id, text, type, order, isRequired, lang);
        _questions.Add(question);

        return question;
    }

    /// <summary>
    /// Removes a question from the survey.
    /// </summary>
    public void RemoveQuestion(Guid questionId)
    {
        EnsureDraft();

        var question = _questions.FirstOrDefault(q => q.Id == questionId);
        if (question == null)
            throw new DomainException("Domain.Survey.QuestionNotInSurvey");

        _questions.Remove(question);
        ReorderQuestions();
    }

    /// <summary>
    /// Reorders questions in the survey.
    /// </summary>
    public void ReorderQuestions(IEnumerable<Guid> questionIds)
    {
        EnsureDraft();

        var questionIdList = questionIds.ToList();
        if (questionIdList.Count != _questions.Count)
            throw new DomainException("Domain.Survey.QuestionIdsMismatch");

        for (int i = 0; i < questionIdList.Count; i++)
        {
            var question = _questions.FirstOrDefault(q => q.Id == questionIdList[i]);
            if (question == null)
                throw new DomainException("Domain.Survey.QuestionNotFoundById", questionIdList[i]);

            question.UpdateOrder(i + 1);
        }
    }

    /// <summary>
    /// Publishes the survey.
    /// </summary>
    public void Publish()
    {
        if (Status != SurveyStatus.Draft)
            throw new DomainException("Domain.Survey.OnlyDraftCanPublish");

        if (!_questions.Any())
            throw new DomainException("Domain.Survey.MustHaveQuestionsToPublish");

        Status = SurveyStatus.Published;
        PublishedAt = DateTime.UtcNow;

        AddDomainEvent(new SurveyPublishedEvent(Id, NamespaceId, Title));
    }

    /// <summary>
    /// Closes the survey.
    /// </summary>
    public void Close()
    {
        if (Status != SurveyStatus.Published)
            throw new DomainException("Domain.Survey.OnlyPublishedCanClose");

        Status = SurveyStatus.Closed;
        ClosedAt = DateTime.UtcNow;
    }

    /// <summary>
    /// Archives the survey.
    /// </summary>
    public void Archive()
    {
        if (Status == SurveyStatus.Draft)
            throw new DomainException("Domain.Survey.DraftCannotArchive");

        Status = SurveyStatus.Archived;
    }

    /// <summary>
    /// Reopens a closed survey.
    /// </summary>
    public void Reopen()
    {
        if (Status != SurveyStatus.Closed)
            throw new DomainException("Domain.Survey.OnlyClosedCanReopen");

        Status = SurveyStatus.Published;
        ClosedAt = null;
    }

    /// <summary>
    /// Regenerates the access token.
    /// </summary>
    public void RegenerateAccessToken()
    {
        AccessToken = GenerateAccessToken();
    }

    /// <summary>
    /// Sets the theme for this survey.
    /// </summary>
    /// <param name="themeId">The saved theme ID (Guid) for custom themes.</param>
    /// <param name="presetThemeId">The preset theme identifier (e.g., "midnight", "ocean").</param>
    /// <param name="customizations">Optional JSON string containing theme customizations.</param>
    public void SetTheme(
        Guid? themeId = null,
        string? presetThemeId = null,
        string? customizations = null
    )
    {
        // A survey can use either a saved theme OR a preset, not both
        if (themeId.HasValue && !string.IsNullOrEmpty(presetThemeId))
            throw new InvalidOperationException("Domain.Survey.CannotSetBothThemes");

        ThemeId = themeId;
        PresetThemeId = presetThemeId;
        ThemeCustomizations = customizations;
    }

    /// <summary>
    /// Updates theme customizations without changing the theme reference.
    /// </summary>
    /// <param name="customizations">JSON string containing theme customizations.</param>
    public void UpdateThemeCustomizations(string? customizations)
    {
        ThemeCustomizations = customizations;
    }

    /// <summary>
    /// Removes the theme from this survey.
    /// </summary>
    public void RemoveTheme()
    {
        ThemeId = null;
        PresetThemeId = null;
        ThemeCustomizations = null;
        Theme = null;
    }

    /// <summary>
    /// Checks if the survey can accept responses.
    /// </summary>
    [Obsolete("Use CanAcceptResponses property instead")]
    public bool CanAcceptResponsesMethod()
    {
        if (Status != SurveyStatus.Published)
            return false;

        if (StartsAt.HasValue && DateTime.UtcNow < StartsAt.Value)
            return false;

        if (EndsAt.HasValue && DateTime.UtcNow > EndsAt.Value)
            return false;

        if (MaxResponses.HasValue && _responses.Count(r => r.IsComplete) >= MaxResponses.Value)
            return false;

        return true;
    }

    private void EnsureDraft()
    {
        if (Status != SurveyStatus.Draft)
            throw new InvalidOperationException("Domain.Survey.CannotModifyAfterPublish");
    }

    private void ReorderQuestions()
    {
        var orderedQuestions = _questions.OrderBy(q => q.Order).ToList();
        for (int i = 0; i < orderedQuestions.Count; i++)
        {
            orderedQuestions[i].UpdateOrder(i + 1);
        }
    }

    private static string GenerateAccessToken()
    {
        return Guid.NewGuid().ToString("N");
    }

    #region Localization Methods

    // TranslationManager handles common translation operations
    private TranslationManager<SurveyTranslation>? _translationManager;

    private TranslationManager<SurveyTranslation> TranslationHelper =>
        _translationManager ??= new TranslationManager<SurveyTranslation>(
            _translations,
            lang => DefaultLanguage = lang
        );

    /// <summary>
    /// Sets the default language for this survey.
    /// </summary>
    public void SetDefaultLanguage(string languageCode)
    {
        if (string.IsNullOrWhiteSpace(languageCode))
            throw new DomainException("Domain.Survey.LanguageCodeRequired");

        DefaultLanguage = languageCode.ToLowerInvariant();
    }

    /// <summary>
    /// Adds or updates a translation for this survey.
    /// </summary>
    public SurveyTranslation AddOrUpdateTranslation(
        string languageCode,
        string title,
        string? description = null,
        string? welcomeMessage = null,
        string? thankYouMessage = null
    )
    {
        var existingTranslation = TranslationHelper.Find(languageCode);

        if (existingTranslation != null)
        {
            existingTranslation.Update(title, description, welcomeMessage, thankYouMessage);
            return existingTranslation;
        }

        var isDefault = TranslationHelper.Count == 0;
        var translation = SurveyTranslation.Create(
            Id,
            languageCode,
            title,
            description,
            welcomeMessage,
            thankYouMessage,
            isDefault
        );

        _translations.Add(translation);

        if (isDefault)
        {
            DefaultLanguage = languageCode.ToLowerInvariant();
        }

        return translation;
    }

    /// <summary>
    /// Removes a translation from this survey.
    /// </summary>
    public void RemoveTranslation(string languageCode) => TranslationHelper.Remove(languageCode);

    /// <summary>
    /// Gets a translation for the specified language, falling back to default if not found.
    /// </summary>
    public SurveyTranslation? GetTranslation(string? languageCode) =>
        TranslationHelper.Get(languageCode);

    /// <summary>
    /// Gets the default translation for this survey.
    /// </summary>
    public SurveyTranslation? GetDefaultTranslation() => TranslationHelper.GetDefault();

    /// <summary>
    /// Gets the localized title for the specified language.
    /// </summary>
    public string GetLocalizedTitle(string? languageCode = null) =>
        GetTranslation(languageCode)?.Title ?? string.Empty;

    /// <summary>
    /// Gets the localized description for the specified language.
    /// </summary>
    public string? GetLocalizedDescription(string? languageCode = null) =>
        GetTranslation(languageCode)?.Description;

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

    /// <summary>
    /// Sets a translation as the default.
    /// </summary>
    public void SetDefaultTranslation(string languageCode) =>
        TranslationHelper.SetDefault(languageCode);

    /// <summary>
    /// Gets all available language codes for this survey.
    /// </summary>
    public IReadOnlyList<string> GetAvailableLanguages() =>
        TranslationHelper.GetAvailableLanguages();

    /// <summary>
    /// Ensures all questions have translations for all languages available in the survey.
    /// Creates empty placeholder translations for any missing languages.
    /// </summary>
    /// <param name="placeholderText">The placeholder text to use for missing translations.</param>
    public void SyncQuestionLanguages(string placeholderText = "[Translation needed]")
    {
        var surveyLanguages = GetAvailableLanguages();

        foreach (var question in _questions)
        {
            var questionLanguages = question
                .Translations.Select(t => t.LanguageCode)
                .ToHashSet(StringComparer.OrdinalIgnoreCase);

            foreach (var language in surveyLanguages)
            {
                if (!questionLanguages.Contains(language))
                {
                    // Copy from default translation if available, otherwise use placeholder
                    var defaultTranslation = question.GetDefaultTranslation();
                    var text = defaultTranslation?.Text ?? placeholderText;

                    question.AddOrUpdateTranslation(
                        language,
                        text,
                        defaultTranslation?.Description,
                        defaultTranslation?.GetTranslatedSettings()
                    );
                }
            }
        }
    }

    /// <summary>
    /// Removes translations for the specified language from the survey and all its questions.
    /// </summary>
    /// <param name="languageCode">The language code to remove.</param>
    /// <exception cref="InvalidOperationException">
    /// Thrown when trying to remove the default language.
    /// </exception>
    public void RemoveLanguageFromAll(string languageCode)
    {
        if (languageCode.Equals(DefaultLanguage, StringComparison.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException("Domain.Survey.CannotRemoveDefaultLanguage");
        }

        // Remove from survey
        TranslationHelper.Remove(languageCode);

        // Remove from all questions
        foreach (var question in _questions)
        {
            var translation = question.Translations.FirstOrDefault(t =>
                t.LanguageCode.Equals(languageCode, StringComparison.OrdinalIgnoreCase)
            );

            if (translation != null)
            {
                question.RemoveTranslation(languageCode);
            }
        }
    }

    /// <summary>
    /// Gets the translation completion status for each language.
    /// </summary>
    /// <returns>Dictionary of language codes to completion percentages (0-100).</returns>
    public IDictionary<string, int> GetTranslationCompletionStatus()
    {
        var languages = GetAvailableLanguages();
        var result = new Dictionary<string, int>();

        foreach (var language in languages)
        {
            var completedQuestions = _questions.Count(q =>
                q.Translations.Any(t =>
                    t.LanguageCode.Equals(language, StringComparison.OrdinalIgnoreCase)
                    && !string.IsNullOrWhiteSpace(t.Text)
                )
            );

            var totalQuestions = _questions.Count;
            var percentage =
                totalQuestions > 0
                    ? (int)Math.Round((double)completedQuestions / totalQuestions * 100)
                    : 100;

            result[language] = percentage;
        }

        return result;
    }

    #endregion
}
