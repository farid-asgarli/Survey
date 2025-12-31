using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.DTOs;

namespace SurveyApp.Application.Features.EmailTemplates.Commands.DuplicateEmailTemplate;

/// <summary>
/// Command to duplicate an existing email template.
/// Creates a copy with all content and settings, but as a non-default template.
/// </summary>
public record DuplicateEmailTemplateCommand(Guid Id, string? NewName = null)
    : IRequest<Result<EmailTemplateDto>>;
