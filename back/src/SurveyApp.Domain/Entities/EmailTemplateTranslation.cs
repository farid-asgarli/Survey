using SurveyApp.Domain.Common;

namespace SurveyApp.Domain.Entities;

/// <summary>
/// Represents a translation for an EmailTemplate entity.
/// </summary>
public class EmailTemplateTranslation : Translation
{
    /// <summary>
    /// Gets the ID of the email template this translation belongs to.
    /// </summary>
    public Guid EmailTemplateId { get; private set; }

    /// <summary>
    /// Gets the translated name of the template.
    /// </summary>
    public string Name { get; private set; } = null!;

    /// <summary>
    /// Gets the translated email subject.
    /// </summary>
    public string Subject { get; private set; } = null!;

    /// <summary>
    /// Gets the translated HTML body of the email.
    /// </summary>
    public string HtmlBody { get; private set; } = null!;

    /// <summary>
    /// Gets the translated plain text body of the email.
    /// </summary>
    public string? PlainTextBody { get; private set; }

    /// <summary>
    /// Gets the JSON representation of the visual editor design state for this translation.
    /// </summary>
    public string? DesignJson { get; private set; }

    /// <summary>
    /// Navigation property to the parent email template.
    /// </summary>
    public EmailTemplate EmailTemplate { get; private set; } = null!;

    private EmailTemplateTranslation() { }

    private EmailTemplateTranslation(
        Guid id,
        Guid emailTemplateId,
        string languageCode,
        string name,
        string subject,
        string htmlBody,
        string? plainTextBody,
        string? designJson,
        bool isDefault
    )
        : base(id, languageCode, isDefault)
    {
        EmailTemplateId = emailTemplateId;
        Name = name;
        Subject = subject;
        HtmlBody = htmlBody;
        PlainTextBody = plainTextBody;
        DesignJson = designJson;
    }

    /// <summary>
    /// Creates a new email template translation.
    /// </summary>
    public static EmailTemplateTranslation Create(
        Guid emailTemplateId,
        string languageCode,
        string name,
        string subject,
        string htmlBody,
        string? plainTextBody = null,
        string? designJson = null,
        bool isDefault = false
    )
    {
        if (string.IsNullOrWhiteSpace(languageCode))
            throw new ArgumentException("Language code is required.", nameof(languageCode));

        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Name is required.", nameof(name));

        if (string.IsNullOrWhiteSpace(subject))
            throw new ArgumentException("Subject is required.", nameof(subject));

        if (string.IsNullOrWhiteSpace(htmlBody))
            throw new ArgumentException("HTML body is required.", nameof(htmlBody));

        return new EmailTemplateTranslation(
            Guid.NewGuid(),
            emailTemplateId,
            languageCode.ToLowerInvariant(),
            name.Trim(),
            subject.Trim(),
            htmlBody,
            plainTextBody,
            designJson,
            isDefault
        );
    }

    /// <summary>
    /// Updates the translation content.
    /// </summary>
    public void Update(
        string name,
        string subject,
        string htmlBody,
        string? plainTextBody,
        string? designJson,
        Guid? userId = null
    )
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Name is required.", nameof(name));

        if (string.IsNullOrWhiteSpace(subject))
            throw new ArgumentException("Subject is required.", nameof(subject));

        if (string.IsNullOrWhiteSpace(htmlBody))
            throw new ArgumentException("HTML body is required.", nameof(htmlBody));

        Name = name.Trim();
        Subject = subject.Trim();
        HtmlBody = htmlBody;
        PlainTextBody = plainTextBody;
        DesignJson = designJson;
        MarkAsModified(userId);
    }
}
