using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.DTOs;
using SurveyApp.Domain.Enums;

namespace SurveyApp.Application.Features.EmailTemplates.Commands.CreateEmailTemplate;

/// <summary>
/// Command to create a new email template.
/// </summary>
public record CreateEmailTemplateCommand : IRequest<Result<EmailTemplateDto>>
{
    public string Name { get; init; } = null!;
    public EmailTemplateType Type { get; init; }
    public string Subject { get; init; } = null!;
    public string HtmlBody { get; init; } = null!;
    public string? PlainTextBody { get; init; }
    public string LanguageCode { get; init; } = "en";

    /// <summary>
    /// JSON representation of the visual editor design state (blocks and styles).
    /// </summary>
    public string? DesignJson { get; init; }
    public bool IsDefault { get; init; }
}
