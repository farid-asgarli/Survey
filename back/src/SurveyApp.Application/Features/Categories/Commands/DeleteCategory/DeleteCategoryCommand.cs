using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Domain.Entities;

namespace SurveyApp.Application.Features.Categories.Commands.DeleteCategory;

/// <summary>
/// Command to delete a survey category.
/// </summary>
public record DeleteCategoryCommand(Guid CategoryId) : IRequest<Result<Unit>>, INamespaceCommand
{
    public static NamespacePermission RequiredPermission => NamespacePermission.ManageSettings;
}
