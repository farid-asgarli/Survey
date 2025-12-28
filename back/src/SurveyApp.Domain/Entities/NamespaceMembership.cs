using SurveyApp.Domain.Common;
using SurveyApp.Domain.Enums;

namespace SurveyApp.Domain.Entities;

/// <summary>
/// Represents the membership of a user in a namespace.
/// </summary>
public class NamespaceMembership : Entity<Guid>
{
    /// <summary>
    /// Gets the user ID.
    /// </summary>
    public Guid UserId { get; private set; }

    /// <summary>
    /// Gets the namespace ID.
    /// </summary>
    public Guid NamespaceId { get; private set; }

    /// <summary>
    /// Gets the role of the user in the namespace.
    /// </summary>
    public NamespaceRole Role { get; private set; }

    /// <summary>
    /// Gets the date and time when the user joined the namespace.
    /// </summary>
    public DateTime JoinedAt { get; private set; }

    /// <summary>
    /// Gets the ID of the user who invited this user (if any).
    /// </summary>
    public Guid? InvitedBy { get; private set; }

    /// <summary>
    /// Gets the user navigation property.
    /// </summary>
    public User User { get; private set; } = null!;

    /// <summary>
    /// Gets the namespace navigation property.
    /// </summary>
    public Namespace Namespace { get; private set; } = null!;

    private NamespaceMembership() { }

    private NamespaceMembership(
        Guid id,
        Guid userId,
        Guid namespaceId,
        NamespaceRole role,
        Guid? invitedBy
    )
        : base(id)
    {
        UserId = userId;
        NamespaceId = namespaceId;
        Role = role;
        JoinedAt = DateTime.UtcNow;
        InvitedBy = invitedBy;
    }

    /// <summary>
    /// Creates a new namespace membership.
    /// </summary>
    public static NamespaceMembership Create(
        Guid userId,
        Guid namespaceId,
        NamespaceRole role,
        Guid? invitedBy = null
    )
    {
        return new NamespaceMembership(Guid.NewGuid(), userId, namespaceId, role, invitedBy);
    }

    /// <summary>
    /// Updates the role of the membership.
    /// </summary>
    public void UpdateRole(NamespaceRole newRole)
    {
        Role = newRole;
    }

    /// <summary>
    /// Promotes the user to a higher role.
    /// </summary>
    public void PromoteRole(NamespaceRole newRole)
    {
        if (newRole >= Role)
            throw new InvalidOperationException("New role must be higher than the current role.");

        Role = newRole;
    }

    /// <summary>
    /// Checks if the user has permission for a specific action.
    /// </summary>
    public bool HasPermission(NamespacePermission permission)
    {
        return permission switch
        {
            NamespacePermission.ViewSurveys => true,
            NamespacePermission.CreateSurvey => Role <= NamespaceRole.Member,
            NamespacePermission.CreateSurveys => Role <= NamespaceRole.Member,
            NamespacePermission.EditSurvey => Role <= NamespaceRole.Member,
            NamespacePermission.EditSurveys => Role <= NamespaceRole.Member,
            NamespacePermission.DeleteSurvey => Role <= NamespaceRole.Admin,
            NamespacePermission.DeleteSurveys => Role <= NamespaceRole.Admin,
            NamespacePermission.ViewResponses => Role <= NamespaceRole.Viewer,
            NamespacePermission.ManageUsers => Role <= NamespaceRole.Admin,
            NamespacePermission.ManageMembers => Role <= NamespaceRole.Admin,
            NamespacePermission.ManageNamespace => Role <= NamespaceRole.Admin,
            NamespacePermission.ManageSettings => Role <= NamespaceRole.Admin,
            NamespacePermission.DeleteNamespace => Role == NamespaceRole.Owner,
            _ => false,
        };
    }
}

/// <summary>
/// Represents the permissions available in a namespace.
/// </summary>
public enum NamespacePermission
{
    ViewSurveys,
    CreateSurvey,
    CreateSurveys,
    EditSurvey,
    EditSurveys,
    DeleteSurvey,
    DeleteSurveys,
    ViewResponses,
    ManageUsers,
    ManageMembers,
    ManageNamespace,
    ManageSettings,
    DeleteNamespace,
}
