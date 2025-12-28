using SurveyApp.Domain.Common;
using SurveyApp.Domain.Enums;
using SurveyApp.Domain.Events;

namespace SurveyApp.Domain.Entities;

/// <summary>
/// Represents a survey in the system.
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
    /// Gets the title of the survey.
    /// </summary>
    public string Title { get; private set; } = null!;

    /// <summary>
    /// Gets the description of the survey.
    /// </summary>
    public string? Description { get; private set; }

    /// <summary>
    /// Gets the status of the survey.
    /// </summary>
    public SurveyStatus Status { get; private set; }

    /// <summary>
    /// Gets the welcome message shown at the start of the survey.
    /// </summary>
    public string? WelcomeMessage { get; private set; }

    /// <summary>
    /// Gets the thank you message shown at the end of the survey.
    /// </summary>
    public string? ThankYouMessage { get; private set; }

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

    private Survey(Guid id, Guid namespaceId, string title, Guid createdBy)
        : base(id)
    {
        NamespaceId = namespaceId;
        Title = title;
        Type = SurveyType.Classic;
        Status = SurveyStatus.Draft;
        AccessToken = GenerateAccessToken();
        AllowAnonymousResponses = true;
        AllowMultipleResponses = false;
        CreatedBy = createdBy;
    }

    /// <summary>
    /// Creates a new survey.
    /// </summary>
    public static Survey Create(Guid namespaceId, string title, Guid createdBy)
    {
        if (string.IsNullOrWhiteSpace(title))
            throw new ArgumentException("Survey title cannot be empty.", nameof(title));

        return new Survey(Guid.NewGuid(), namespaceId, title, createdBy);
    }

    /// <summary>
    /// Creates a new survey with a specific type.
    /// </summary>
    public static Survey Create(
        Guid namespaceId,
        string title,
        Guid createdBy,
        SurveyType type,
        CxMetricType? cxMetricType = null
    )
    {
        if (string.IsNullOrWhiteSpace(title))
            throw new ArgumentException("Survey title cannot be empty.", nameof(title));

        var survey = new Survey(Guid.NewGuid(), namespaceId, title, createdBy)
        {
            Type = type,
            CxMetricType = type == SurveyType.CustomerExperience ? cxMetricType : null,
        };

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
    /// Updates the survey title.
    /// </summary>
    public void UpdateTitle(string title)
    {
        if (string.IsNullOrWhiteSpace(title))
            throw new ArgumentException("Survey title cannot be empty.", nameof(title));

        Title = title;
    }

    /// <summary>
    /// Updates the survey description.
    /// </summary>
    public void UpdateDescription(string? description)
    {
        Description = description;
    }

    /// <summary>
    /// Updates the welcome message.
    /// </summary>
    public void UpdateWelcomeMessage(string? message)
    {
        WelcomeMessage = message;
    }

    /// <summary>
    /// Updates the thank you message.
    /// </summary>
    public void UpdateThankYouMessage(string? message)
    {
        ThankYouMessage = message;
    }

    /// <summary>
    /// Updates the survey details.
    /// </summary>
    public void UpdateDetails(string title, string? description)
    {
        UpdateTitle(title);
        UpdateDescription(description);
    }

    /// <summary>
    /// Sets the welcome message.
    /// </summary>
    public void SetWelcomeMessage(string message)
    {
        WelcomeMessage = message;
    }

    /// <summary>
    /// Sets the thank you message.
    /// </summary>
    public void SetThankYouMessage(string message)
    {
        ThankYouMessage = message;
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
            throw new ArgumentException("Start date must be before end date.");

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
    public Question AddQuestion(string text, QuestionType type, bool isRequired = false)
    {
        EnsureDraft();

        var order = _questions.Count + 1;
        var question = Question.Create(Id, text, type, order, isRequired);
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
            throw new InvalidOperationException("Question not found in this survey.");

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
            throw new ArgumentException("Question IDs do not match the survey questions.");

        for (int i = 0; i < questionIdList.Count; i++)
        {
            var question = _questions.FirstOrDefault(q => q.Id == questionIdList[i]);
            if (question == null)
                throw new ArgumentException($"Question {questionIdList[i]} not found in survey.");

            question.UpdateOrder(i + 1);
        }
    }

    /// <summary>
    /// Publishes the survey.
    /// </summary>
    public void Publish()
    {
        if (Status != SurveyStatus.Draft)
            throw new InvalidOperationException("Only draft surveys can be published.");

        if (!_questions.Any())
            throw new InvalidOperationException(
                "Survey must have at least one question to be published."
            );

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
            throw new InvalidOperationException("Only published surveys can be closed.");

        Status = SurveyStatus.Closed;
        ClosedAt = DateTime.UtcNow;
    }

    /// <summary>
    /// Archives the survey.
    /// </summary>
    public void Archive()
    {
        if (Status == SurveyStatus.Draft)
            throw new InvalidOperationException("Draft surveys cannot be archived.");

        Status = SurveyStatus.Archived;
    }

    /// <summary>
    /// Reopens a closed survey.
    /// </summary>
    public void Reopen()
    {
        if (Status != SurveyStatus.Closed)
            throw new InvalidOperationException("Only closed surveys can be reopened.");

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
            throw new InvalidOperationException("Cannot set both ThemeId and PresetThemeId.");

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
            throw new InvalidOperationException(
                "Survey cannot be modified after it has been published."
            );
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

    /// <summary>
    /// Sets the default language for this survey.
    /// </summary>
    public void SetDefaultLanguage(string languageCode)
    {
        if (string.IsNullOrWhiteSpace(languageCode))
            throw new ArgumentException("Language code is required.", nameof(languageCode));

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
        var existingTranslation = _translations.FirstOrDefault(t =>
            t.LanguageCode.Equals(languageCode, StringComparison.OrdinalIgnoreCase)
        );

        if (existingTranslation != null)
        {
            existingTranslation.Update(title, description, welcomeMessage, thankYouMessage);
            return existingTranslation;
        }

        var isDefault = !_translations.Any();
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
    public void RemoveTranslation(string languageCode)
    {
        var translation = _translations.FirstOrDefault(t =>
            t.LanguageCode.Equals(languageCode, StringComparison.OrdinalIgnoreCase)
        );

        if (translation == null)
            return;

        if (translation.IsDefault && _translations.Count > 1)
            throw new InvalidOperationException(
                "Cannot remove the default translation while other translations exist."
            );

        _translations.Remove(translation);

        // If we removed the default, set a new one
        if (translation.IsDefault && _translations.Count > 0)
        {
            var newDefault = _translations.First();
            newDefault.SetAsDefault();
            DefaultLanguage = newDefault.LanguageCode;
        }
    }

    /// <summary>
    /// Gets a translation for the specified language, falling back to default if not found.
    /// </summary>
    public SurveyTranslation? GetTranslation(string? languageCode)
    {
        if (string.IsNullOrWhiteSpace(languageCode))
            return _translations.FirstOrDefault(t => t.IsDefault);

        return _translations.FirstOrDefault(t =>
                t.LanguageCode.Equals(languageCode, StringComparison.OrdinalIgnoreCase)
            ) ?? _translations.FirstOrDefault(t => t.IsDefault);
    }

    /// <summary>
    /// Sets a translation as the default.
    /// </summary>
    public void SetDefaultTranslation(string languageCode)
    {
        var translation = _translations.FirstOrDefault(t =>
            t.LanguageCode.Equals(languageCode, StringComparison.OrdinalIgnoreCase)
        );

        if (translation == null)
            throw new InvalidOperationException(
                $"Translation for language '{languageCode}' not found."
            );

        foreach (var t in _translations)
        {
            t.RemoveDefault();
        }

        translation.SetAsDefault();
        DefaultLanguage = languageCode.ToLowerInvariant();
    }

    /// <summary>
    /// Gets all available language codes for this survey.
    /// </summary>
    public IReadOnlyList<string> GetAvailableLanguages()
    {
        return _translations.Select(t => t.LanguageCode).ToList().AsReadOnly();
    }

    #endregion
}
