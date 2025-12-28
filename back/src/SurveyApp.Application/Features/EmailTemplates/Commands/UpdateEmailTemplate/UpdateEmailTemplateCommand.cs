using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.DTOs;
using SurveyApp.Domain.Enums;

namespace SurveyApp.Application.Features.EmailTemplates.Commands.UpdateEmailTemplate;

/// <summary>
/// Command to update an existing email template.
/// </summary>
public record UpdateEmailTemplateCommand : IRequest<Result<EmailTemplateDto>>
{
    public Guid Id { get; init; }
    public string? Name { get; init; }
    public EmailTemplateType? Type { get; init; }
    public string? Subject { get; init; }
    public string? HtmlBody { get; init; }
    public string? PlainTextBody { get; init; }

    /// <summary>
    /// JSON representation of the visual editor design state (blocks and styles).
    /// </summary>
    public string? DesignJson { get; init; }
    public bool? IsDefault { get; init; }
}
