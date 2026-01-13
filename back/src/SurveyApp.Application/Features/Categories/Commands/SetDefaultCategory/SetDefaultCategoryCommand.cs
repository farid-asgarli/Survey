using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Domain.Entities;

namespace SurveyApp.Application.Features.Categories.Commands.SetDefaultCategory;

/// <summary>
/// Command to set a category as the default for the namespace.
/// </summary>
public record SetDefaultCategoryCommand(Guid CategoryId) : IRequest<Result<Unit>>, INamespaceCommand
{
    public static NamespacePermission RequiredPermission => NamespacePermission.ManageSettings;
}
