using SurveyApp.Domain.Enums;

namespace SurveyApp.API.Models;

/// <summary>
/// Request model for updating a member's role.
/// The namespace ID and membership ID are provided in the URL.
/// </summary>
public record UpdateMemberRoleRequest
{
    /// <summary>
    /// The new role to assign to the member.
    /// </summary>
    public NamespaceRole Role { get; init; }
}

/// <summary>
/// Request model for updating a namespace.
/// The namespace ID is provided in the URL.
/// </summary>
public record UpdateNamespaceRequest
{
    /// <summary>
    /// The new name for the namespace.
    /// </summary>
    public string Name { get; init; } = string.Empty;

    /// <summary>
    /// The new description for the namespace.
    /// </summary>
    public string? Description { get; init; }

    /// <summary>
    /// The new logo URL for the namespace.
    /// </summary>
    public string? LogoUrl { get; init; }
}

/// <summary>
/// Request model for inviting a user to a namespace.
/// The namespace ID is provided in the URL.
/// </summary>
public record InviteMemberRequest
{
    /// <summary>
    /// The email of the user to invite.
    /// </summary>
    public string Email { get; init; } = string.Empty;

    /// <summary>
    /// The role to assign to the invited user.
    /// </summary>
    public NamespaceRole Role { get; init; }
}
