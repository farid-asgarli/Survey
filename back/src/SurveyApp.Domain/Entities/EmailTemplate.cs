using SurveyApp.Domain.Common;
using SurveyApp.Domain.Enums;

namespace SurveyApp.Domain.Entities;

/// <summary>
/// Represents an email template for survey distributions.
/// </summary>
public class EmailTemplate : AggregateRoot<Guid>
{
    private readonly List<string> _availablePlaceholders = [];

    /// <summary>
    /// Gets the namespace ID this template belongs to.
    /// </summary>
    public Guid NamespaceId { get; private set; }

    /// <summary>
    /// Gets the name of the template.
    /// </summary>
    public string Name { get; private set; } = null!;

    /// <summary>
    /// Gets the type of the template.
    /// </summary>
    public EmailTemplateType Type { get; private set; }

    /// <summary>
    /// Gets the email subject.
    /// </summary>
    public string Subject { get; private set; } = null!;

    /// <summary>
    /// Gets the HTML body of the email.
    /// </summary>
    public string HtmlBody { get; private set; } = null!;

    /// <summary>
    /// Gets the plain text body of the email.
    /// </summary>
    public string? PlainTextBody { get; private set; }

    /// <summary>
    /// Gets the JSON representation of the visual editor design state (blocks and styles).
    /// This enables resuming editing in the visual editor.
    /// </summary>
    public string? DesignJson { get; private set; }

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

    private EmailTemplate(
        Guid namespaceId,
        string name,
        EmailTemplateType type,
        string subject,
        string htmlBody
    )
        : base(Guid.NewGuid())
    {
        NamespaceId = namespaceId;
        Name = name;
        Type = type;
        Subject = subject;
        HtmlBody = htmlBody;
        _availablePlaceholders.AddRange(StandardPlaceholders);
    }

    /// <summary>
    /// Creates a new email template.
    /// </summary>
    public static EmailTemplate Create(
        Guid namespaceId,
        string name,
        EmailTemplateType type,
        string subject,
        string htmlBody
    )
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Name cannot be empty.", nameof(name));

        if (string.IsNullOrWhiteSpace(subject))
            throw new ArgumentException("Subject cannot be empty.", nameof(subject));

        if (string.IsNullOrWhiteSpace(htmlBody))
            throw new ArgumentException("HTML body cannot be empty.", nameof(htmlBody));

        return new EmailTemplate(namespaceId, name, type, subject, htmlBody);
    }

    /// <summary>
    /// Updates the template name.
    /// </summary>
    public void UpdateName(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Name cannot be empty.", nameof(name));

        Name = name;
    }

    /// <summary>
    /// Updates the template type.
    /// </summary>
    public void UpdateType(EmailTemplateType type)
    {
        Type = type;
    }

    /// <summary>
    /// Updates the subject.
    /// </summary>
    public void UpdateSubject(string subject)
    {
        if (string.IsNullOrWhiteSpace(subject))
            throw new ArgumentException("Subject cannot be empty.", nameof(subject));

        Subject = subject;
    }

    /// <summary>
    /// Updates the HTML body.
    /// </summary>
    public void UpdateHtmlBody(string htmlBody)
    {
        if (string.IsNullOrWhiteSpace(htmlBody))
            throw new ArgumentException("HTML body cannot be empty.", nameof(htmlBody));

        HtmlBody = htmlBody;
    }

    /// <summary>
    /// Updates the plain text body.
    /// </summary>
    public void UpdatePlainTextBody(string? plainTextBody)
    {
        PlainTextBody = plainTextBody;
    }

    /// <summary>
    /// Updates the design JSON (visual editor state).
    /// </summary>
    public void UpdateDesignJson(string? designJson)
    {
        DesignJson = designJson;
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
    /// Renders the template with the provided values.
    /// </summary>
    public (string Subject, string HtmlBody, string? PlainTextBody) Render(
        Dictionary<string, string> values
    )
    {
        var renderedSubject = RenderText(Subject, values);
        var renderedHtmlBody = RenderText(HtmlBody, values);
        var renderedPlainTextBody =
            PlainTextBody != null ? RenderText(PlainTextBody, values) : null;

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
}
