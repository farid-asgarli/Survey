using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Domain.Entities;

namespace SurveyApp.Application.Features.Categories.Commands.ReorderCategories;

/// <summary>
/// Command to reorder survey categories.
/// </summary>
public record ReorderCategoriesCommand : IRequest<Result<Unit>>, INamespaceCommand
{
    public static NamespacePermission RequiredPermission => NamespacePermission.ManageSettings;

    /// <summary>
    /// The ordered list of category IDs representing the new order.
    /// </summary>
    public List<Guid> CategoryIds { get; init; } = [];
}
