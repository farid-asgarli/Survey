using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Domain.Entities;

namespace SurveyApp.Application.Features.Namespaces.Commands.DeleteNamespace;

/// <summary>
/// Command to delete a namespace.
/// Only the namespace owner can delete a namespace.
/// </summary>
public record DeleteNamespaceCommand : IRequest<Result<Unit>>, INamespaceCommand
{
    /// <summary>
    /// The permission required to execute this command.
    /// </summary>
    public static NamespacePermission RequiredPermission => NamespacePermission.DeleteNamespace;

    /// <summary>
    /// The ID of the namespace to delete.
    /// </summary>
    public Guid NamespaceId { get; init; }
}
