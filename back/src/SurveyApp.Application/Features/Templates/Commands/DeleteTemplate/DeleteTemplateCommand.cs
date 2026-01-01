using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Domain.Entities;

namespace SurveyApp.Application.Features.Templates.Commands.DeleteTemplate;

/// <summary>
/// Command to delete a template.
/// </summary>
/// <param name="TemplateId">The template ID to delete.</param>
public record DeleteTemplateCommand(Guid TemplateId) : IRequest<Result>, INamespaceCommand
{
    /// <summary>
    /// The permission required to execute this command.
    /// </summary>
    public static NamespacePermission RequiredPermission => NamespacePermission.DeleteSurveys;
}
