using SurveyApp.Domain.Common;
using SurveyApp.Domain.Enums;

namespace SurveyApp.Domain.Events;

/// <summary>
/// Event raised when a user is invited to a namespace.
/// </summary>
public sealed class UserInvitedToNamespaceEvent(
    Guid namespaceId,
    Guid userId,
    NamespaceRole role,
    Guid? invitedBy
) : IDomainEvent
{
    /// <summary>
    /// Gets the namespace ID.
    /// </summary>
    public Guid NamespaceId { get; } = namespaceId;

    /// <summary>
    /// Gets the user ID.
    /// </summary>
    public Guid UserId { get; } = userId;

    /// <summary>
    /// Gets the role assigned to the user.
    /// </summary>
    public NamespaceRole Role { get; } = role;

    /// <summary>
    /// Gets the ID of the user who sent the invitation.
    /// </summary>
    public Guid? InvitedBy { get; } = invitedBy;

    /// <inheritdoc />
    public DateTime OccurredOn { get; } = DateTime.UtcNow;
}
