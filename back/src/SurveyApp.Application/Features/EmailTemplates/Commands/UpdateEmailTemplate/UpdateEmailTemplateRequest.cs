using SurveyApp.Domain.Enums;

namespace SurveyApp.Application.Features.EmailTemplates.Commands.UpdateEmailTemplate;

/// <summary>
/// Request body for updating an email template.
/// The template ID comes from the route parameter.
/// </summary>
public record UpdateEmailTemplateRequest
{
    public string? Name { get; init; }
    public EmailTemplateType? Type { get; init; }
    public string? Subject { get; init; }
    public string? HtmlBody { get; init; }
    public string? PlainTextBody { get; init; }
    public string? LanguageCode { get; init; }

    /// <summary>
    /// JSON representation of the visual editor design state (blocks and styles).
    /// </summary>
    public string? DesignJson { get; init; }
    public bool? IsDefault { get; init; }
}
