using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Domain.Enums;

namespace SurveyApp.Application.Features.Namespaces.Commands.UpdateMemberRole;

/// <summary>
/// Command to update a member's role in a namespace.
/// </summary>
public record UpdateMemberRoleCommand : IRequest<Result<UpdateMemberRoleResult>>
{
    /// <summary>
    /// The namespace ID.
    /// </summary>
    public Guid NamespaceId { get; init; }

    /// <summary>
    /// The membership ID to update.
    /// </summary>
    public Guid MembershipId { get; init; }

    /// <summary>
    /// The new role to assign.
    /// </summary>
    public NamespaceRole Role { get; init; }
}

/// <summary>
/// Result of updating a member's role.
/// </summary>
public record UpdateMemberRoleResult
{
    /// <summary>
    /// The membership ID that was updated.
    /// </summary>
    public Guid MembershipId { get; init; }

    /// <summary>
    /// The user ID of the member.
    /// </summary>
    public Guid UserId { get; init; }

    /// <summary>
    /// The new role assigned to the member.
    /// </summary>
    public NamespaceRole Role { get; init; }
}
