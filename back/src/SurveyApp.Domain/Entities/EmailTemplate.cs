using SurveyApp.Domain.Common;
using SurveyApp.Domain.Enums;

namespace SurveyApp.Domain.Entities;

/// <summary>
/// Represents an email template for survey distributions.
/// All localizable content (Name, Subject, HtmlBody, PlainTextBody, DesignJson)
/// is stored in the Translations collection.
/// </summary>
public class EmailTemplate : AggregateRoot<Guid>, ILocalizable<EmailTemplateTranslation>
{
    private readonly List<string> _availablePlaceholders = [];
    private readonly List<EmailTemplateTranslation> _translations = [];

    /// <summary>
    /// Gets the namespace ID this template belongs to.
    /// </summary>
    public Guid NamespaceId { get; private set; }

    #region Localized Content Properties (resolved from default translation)

    /// <summary>
    /// Gets the name of the template from the default translation.
    /// </summary>
    public string Name => GetDefaultTranslation()?.Name ?? string.Empty;

    /// <summary>
    /// Gets the email subject from the default translation.
    /// </summary>
    public string Subject => GetDefaultTranslation()?.Subject ?? string.Empty;

    /// <summary>
    /// Gets the HTML body of the email from the default translation.
    /// </summary>
    public string HtmlBody => GetDefaultTranslation()?.HtmlBody ?? string.Empty;

    /// <summary>
    /// Gets the plain text body of the email from the default translation.
    /// </summary>
    public string? PlainTextBody => GetDefaultTranslation()?.PlainTextBody;

    /// <summary>
    /// Gets the JSON representation of the visual editor design state from the default translation.
    /// </summary>
    public string? DesignJson => GetDefaultTranslation()?.DesignJson;

    #endregion

    /// <summary>
    /// Gets the default language code for this template (ISO 639-1).
    /// </summary>
    public string DefaultLanguage { get; private set; } = "en";

    /// <summary>
    /// Gets the translations for this template.
    /// </summary>
    public IReadOnlyCollection<EmailTemplateTranslation> Translations => _translations.AsReadOnly();

    /// <summary>
    /// Gets the type of the template.
    /// </summary>
    public EmailTemplateType Type { get; private set; }

    /// <summary>
    /// Gets whether this is the default template for its type in the namespace.
    /// </summary>
    public bool IsDefault { get; private set; }

    /// <summary>
    /// Gets the available placeholders for this template.
    /// </summary>
    public IReadOnlyList<string> AvailablePlaceholders => _availablePlaceholders.AsReadOnly();

    /// <summary>
    /// Available standard placeholders for email templates.
    /// </summary>
    public static readonly string[] StandardPlaceholders =
    [
        "{{respondent.name}}",
        "{{respondent.email}}",
        "{{survey.title}}",
        "{{survey.description}}",
        "{{survey.link}}",
        "{{survey.deadline}}",
        "{{sender.name}}",
        "{{namespace.name}}",
        "{{unsubscribe.link}}",
    ];

    private EmailTemplate() { }

    private EmailTemplate(Guid namespaceId, EmailTemplateType type)
        : base(Guid.NewGuid())
    {
        NamespaceId = namespaceId;
        Type = type;
        _availablePlaceholders.AddRange(StandardPlaceholders);
    }

    /// <summary>
    /// Creates a new email template with a default translation.
    /// </summary>
    /// <param name="namespaceId">The namespace ID.</param>
    /// <param name="name">The template name.</param>
    /// <param name="type">The template type.</param>
    /// <param name="subject">The email subject.</param>
    /// <param name="htmlBody">The HTML body.</param>
    /// <param name="languageCode">The default language code (ISO 639-1). Defaults to "en".</param>
    /// <param name="plainTextBody">Optional plain text body.</param>
    /// <param name="designJson">Optional design JSON.</param>
    public static EmailTemplate Create(
        Guid namespaceId,
        string name,
        EmailTemplateType type,
        string subject,
        string htmlBody,
        string languageCode = "en",
        string? plainTextBody = null,
        string? designJson = null
    )
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new DomainException("Domain.EmailTemplate.NameEmpty");

        if (string.IsNullOrWhiteSpace(subject))
            throw new DomainException("Domain.EmailTemplate.SubjectEmpty");

        if (string.IsNullOrWhiteSpace(htmlBody))
            throw new DomainException("Domain.EmailTemplate.HtmlBodyEmpty");

        var template = new EmailTemplate(namespaceId, type);
        template.DefaultLanguage = languageCode.ToLowerInvariant();

        // Create the default translation
        template.AddOrUpdateTranslation(
            languageCode,
            name,
            subject,
            htmlBody,
            plainTextBody,
            designJson
        );

        return template;
    }

    /// <summary>
    /// Updates the template name in the specified language (or default language).
    /// </summary>
    public void UpdateName(string name, string? languageCode = null)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new DomainException("Domain.EmailTemplate.NameEmpty");

        var lang = languageCode ?? DefaultLanguage;
        var translation = GetTranslation(lang);

        if (translation == null)
        {
            throw new DomainException("Domain.Translation.NotFoundCreateFirst");
        }

        translation.Update(
            name,
            translation.Subject,
            translation.HtmlBody,
            translation.PlainTextBody,
            translation.DesignJson
        );
    }

    /// <summary>
    /// Updates the template type.
    /// </summary>
    public void UpdateType(EmailTemplateType type)
    {
        Type = type;
    }

    /// <summary>
    /// Updates the subject in the specified language (or default language).
    /// </summary>
    public void UpdateSubject(string subject, string? languageCode = null)
    {
        if (string.IsNullOrWhiteSpace(subject))
            throw new DomainException("Domain.EmailTemplate.SubjectEmpty");

        var lang = languageCode ?? DefaultLanguage;
        var translation = GetTranslation(lang);

        if (translation != null)
        {
            translation.Update(
                translation.Name,
                subject,
                translation.HtmlBody,
                translation.PlainTextBody,
                translation.DesignJson
            );
        }
    }

    /// <summary>
    /// Updates the HTML body in the specified language (or default language).
    /// </summary>
    public void UpdateHtmlBody(string htmlBody, string? languageCode = null)
    {
        if (string.IsNullOrWhiteSpace(htmlBody))
            throw new DomainException("Domain.EmailTemplate.HtmlBodyEmpty");

        var lang = languageCode ?? DefaultLanguage;
        var translation = GetTranslation(lang);

        if (translation != null)
        {
            translation.Update(
                translation.Name,
                translation.Subject,
                htmlBody,
                translation.PlainTextBody,
                translation.DesignJson
            );
        }
    }

    /// <summary>
    /// Updates the plain text body in the specified language (or default language).
    /// </summary>
    public void UpdatePlainTextBody(string? plainTextBody, string? languageCode = null)
    {
        var lang = languageCode ?? DefaultLanguage;
        var translation = GetTranslation(lang);

        if (translation != null)
        {
            translation.Update(
                translation.Name,
                translation.Subject,
                translation.HtmlBody,
                plainTextBody,
                translation.DesignJson
            );
        }
    }

    /// <summary>
    /// Updates the design JSON (visual editor state) in the specified language (or default language).
    /// </summary>
    public void UpdateDesignJson(string? designJson, string? languageCode = null)
    {
        var lang = languageCode ?? DefaultLanguage;
        var translation = GetTranslation(lang);

        if (translation != null)
        {
            translation.Update(
                translation.Name,
                translation.Subject,
                translation.HtmlBody,
                translation.PlainTextBody,
                designJson
            );
        }
    }

    /// <summary>
    /// Sets this template as the default for its type.
    /// </summary>
    public void SetAsDefault()
    {
        IsDefault = true;
    }

    /// <summary>
    /// Removes the default status from this template.
    /// </summary>
    public void RemoveDefault()
    {
        IsDefault = false;
    }

    /// <summary>
    /// Adds a custom placeholder to the template.
    /// </summary>
    public void AddPlaceholder(string placeholder)
    {
        if (!_availablePlaceholders.Contains(placeholder))
        {
            _availablePlaceholders.Add(placeholder);
        }
    }

    /// <summary>
    /// Renders the template with the provided values for the specified language.
    /// </summary>
    public (string Subject, string HtmlBody, string? PlainTextBody) Render(
        Dictionary<string, string> values,
        string? languageCode = null
    )
    {
        var translation = GetTranslation(languageCode);
        if (translation == null)
        {
            return (string.Empty, string.Empty, null);
        }

        var renderedSubject = RenderText(translation.Subject, values);
        var renderedHtmlBody = RenderText(translation.HtmlBody, values);
        var renderedPlainTextBody =
            translation.PlainTextBody != null
                ? RenderText(translation.PlainTextBody, values)
                : null;

        return (renderedSubject, renderedHtmlBody, renderedPlainTextBody);
    }

    private static string RenderText(string template, Dictionary<string, string> values)
    {
        var result = template;
        foreach (var (key, value) in values)
        {
            result = result.Replace(key, value);
        }
        return result;
    }

    #region Localization Methods

    // TranslationManager handles common translation operations
    private TranslationManager<EmailTemplateTranslation>? _translationManager;

    private TranslationManager<EmailTemplateTranslation> TranslationHelper =>
        _translationManager ??= new TranslationManager<EmailTemplateTranslation>(
            _translations,
            lang => DefaultLanguage = lang
        );

    /// <summary>
    /// Sets the default language for this template.
    /// </summary>
    public void SetDefaultLanguage(string languageCode)
    {
        if (string.IsNullOrWhiteSpace(languageCode))
            throw new DomainException("Domain.EmailTemplate.LanguageCodeRequired");

        DefaultLanguage = languageCode.ToLowerInvariant();
    }

    /// <summary>
    /// Adds or updates a translation for this template.
    /// </summary>
    public EmailTemplateTranslation AddOrUpdateTranslation(
        string languageCode,
        string name,
        string subject,
        string htmlBody,
        string? plainTextBody = null,
        string? designJson = null
    )
    {
        var existingTranslation = TranslationHelper.Find(languageCode);

        if (existingTranslation != null)
        {
            existingTranslation.Update(name, subject, htmlBody, plainTextBody, designJson);
            return existingTranslation;
        }

        var isDefault = TranslationHelper.Count == 0;
        var translation = EmailTemplateTranslation.Create(
            Id,
            languageCode,
            name,
            subject,
            htmlBody,
            plainTextBody,
            designJson,
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
    /// Removes a translation from this template.
    /// </summary>
    public void RemoveTranslation(string languageCode) => TranslationHelper.Remove(languageCode);

    /// <summary>
    /// Gets a translation for the specified language, falling back to default if not found.
    /// </summary>
    public EmailTemplateTranslation? GetTranslation(string? languageCode) =>
        TranslationHelper.Get(languageCode);

    /// <summary>
    /// Gets the default translation for this template.
    /// </summary>
    public EmailTemplateTranslation? GetDefaultTranslation() => TranslationHelper.GetDefault();

    /// <summary>
    /// Gets the localized name for the specified language.
    /// </summary>
    public string GetLocalizedName(string? languageCode = null) =>
        GetTranslation(languageCode)?.Name ?? string.Empty;

    /// <summary>
    /// Gets the localized subject for the specified language.
    /// </summary>
    public string GetLocalizedSubject(string? languageCode = null) =>
        GetTranslation(languageCode)?.Subject ?? string.Empty;

    /// <summary>
    /// Gets the localized HTML body for the specified language.
    /// </summary>
    public string GetLocalizedHtmlBody(string? languageCode = null) =>
        GetTranslation(languageCode)?.HtmlBody ?? string.Empty;

    /// <summary>
    /// Gets the localized plain text body for the specified language.
    /// </summary>
    public string? GetLocalizedPlainTextBody(string? languageCode = null) =>
        GetTranslation(languageCode)?.PlainTextBody;

    /// <summary>
    /// Sets a translation as the default.
    /// </summary>
    public void SetDefaultTranslation(string languageCode) =>
        TranslationHelper.SetDefault(languageCode);

    /// <summary>
    /// Gets all available language codes for this template.
    /// </summary>
    public IReadOnlyList<string> GetAvailableLanguages() =>
        TranslationHelper.GetAvailableLanguages();

    #endregion
}
