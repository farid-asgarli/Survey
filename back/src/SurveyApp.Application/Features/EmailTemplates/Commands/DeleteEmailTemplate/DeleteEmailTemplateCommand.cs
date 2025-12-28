using MediatR;
using SurveyApp.Application.Common;

namespace SurveyApp.Application.Features.EmailTemplates.Commands.DeleteEmailTemplate;

/// <summary>
/// Command to delete an email template.
/// </summary>
public record DeleteEmailTemplateCommand(Guid Id) : IRequest<Result<bool>>;
