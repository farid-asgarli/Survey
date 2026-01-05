using SurveyApp.Domain.Common;
using SurveyApp.Domain.Enums;

namespace SurveyApp.Domain.Entities;

/// <summary>
/// Represents an in-app notification for a user.
/// </summary>
public class Notification : AggregateRoot<Guid>
{
    /// <summary>
    /// Gets the user ID this notification belongs to.
    /// </summary>
    public Guid UserId { get; private set; }

    /// <summary>
    /// Gets the notification type.
    /// </summary>
    public NotificationType Type { get; private set; }

    /// <summary>
    /// Gets the notification title (localization key or plain text).
    /// </summary>
    public string Title { get; private set; } = null!;

    /// <summary>
    /// Gets the notification message (localization key or plain text).
    /// </summary>
    public string Message { get; private set; } = null!;

    /// <summary>
    /// Gets the optional URL to navigate to when clicked.
    /// </summary>
    public string? ActionUrl { get; private set; }

    /// <summary>
    /// Gets the optional action label.
    /// </summary>
    public string? ActionLabel { get; private set; }

    /// <summary>
    /// Gets whether the notification has been read.
    /// </summary>
    public bool IsRead { get; private set; }

    /// <summary>
    /// Gets the time when the notification was read.
    /// </summary>
    public DateTime? ReadAt { get; private set; }

    /// <summary>
    /// Gets additional metadata as JSON.
    /// </summary>
    public string? Metadata { get; private set; }

    /// <summary>
    /// Gets the related entity ID (e.g., survey ID, namespace ID).
    /// </summary>
    public Guid? RelatedEntityId { get; private set; }

    /// <summary>
    /// Gets the related entity type (e.g., "Survey", "Namespace").
    /// </summary>
    public string? RelatedEntityType { get; private set; }

    /// <summary>
    /// Gets whether the notification is archived/deleted.
    /// </summary>
    public bool IsArchived { get; private set; }

    /// <summary>
    /// Gets the user navigation property.
    /// </summary>
    public User User { get; private set; } = null!;

    private Notification() { }

    private Notification(
        Guid id,
        Guid userId,
        NotificationType type,
        string title,
        string message,
        string? actionUrl = null,
        string? actionLabel = null,
        Guid? relatedEntityId = null,
        string? relatedEntityType = null,
        string? metadata = null
    )
        : base(id)
    {
        UserId = userId;
        Type = type;
        Title = title;
        Message = message;
        ActionUrl = actionUrl;
        ActionLabel = actionLabel;
        RelatedEntityId = relatedEntityId;
        RelatedEntityType = relatedEntityType;
        Metadata = metadata;
        IsRead = false;
        IsArchived = false;
    }

    /// <summary>
    /// Creates a new notification.
    /// </summary>
    public static Notification Create(
        Guid userId,
        NotificationType type,
        string title,
        string message,
        string? actionUrl = null,
        string? actionLabel = null,
        Guid? relatedEntityId = null,
        string? relatedEntityType = null,
        string? metadata = null
    )
    {
        if (userId == Guid.Empty)
            throw new DomainException("Domain.Notification.UserIdRequired");

        if (string.IsNullOrWhiteSpace(title))
            throw new DomainException("Domain.Notification.TitleRequired");

        if (string.IsNullOrWhiteSpace(message))
            throw new DomainException("Domain.Notification.MessageRequired");

        return new Notification(
            Guid.NewGuid(),
            userId,
            type,
            title,
            message,
            actionUrl,
            actionLabel,
            relatedEntityId,
            relatedEntityType,
            metadata
        );
    }

    /// <summary>
    /// Marks the notification as read.
    /// </summary>
    public void MarkAsRead()
    {
        if (!IsRead)
        {
            IsRead = true;
            ReadAt = DateTime.UtcNow;
        }
    }

    /// <summary>
    /// Marks the notification as unread.
    /// </summary>
    public void MarkAsUnread()
    {
        IsRead = false;
        ReadAt = null;
    }

    /// <summary>
    /// Archives the notification (soft delete).
    /// </summary>
    public void Archive()
    {
        IsArchived = true;
    }

    /// <summary>
    /// Restores an archived notification.
    /// </summary>
    public void Restore()
    {
        IsArchived = false;
    }

    #region Factory Methods for Common Notification Types

    /// <summary>
    /// Creates a workspace invitation notification.
    /// </summary>
    public static Notification CreateWorkspaceInvitation(
        Guid userId,
        string workspaceName,
        string roleName,
        string inviterName,
        Guid namespaceId
    )
    {
        return Create(
            userId,
            NotificationType.WorkspaceInvitation,
            "notifications.types.workspaceInvitation.title",
            "notifications.types.workspaceInvitation.message",
            actionUrl: $"/workspaces/{namespaceId}",
            actionLabel: "notifications.actions.viewWorkspace",
            relatedEntityId: namespaceId,
            relatedEntityType: "Namespace",
            metadata: System.Text.Json.JsonSerializer.Serialize(
                new
                {
                    workspaceName,
                    roleName,
                    inviterName,
                }
            )
        );
    }

    /// <summary>
    /// Creates a new survey response notification.
    /// </summary>
    public static Notification CreateNewResponse(
        Guid userId,
        string surveyTitle,
        Guid surveyId,
        Guid responseId
    )
    {
        return Create(
            userId,
            NotificationType.NewResponse,
            "notifications.types.newResponse.title",
            "notifications.types.newResponse.message",
            actionUrl: $"/surveys/{surveyId}/responses/{responseId}",
            actionLabel: "notifications.actions.viewResponse",
            relatedEntityId: surveyId,
            relatedEntityType: "Survey",
            metadata: System.Text.Json.JsonSerializer.Serialize(
                new { surveyTitle, responseId = responseId.ToString() }
            )
        );
    }

    /// <summary>
    /// Creates a survey published notification.
    /// </summary>
    public static Notification CreateSurveyPublished(Guid userId, string surveyTitle, Guid surveyId)
    {
        return Create(
            userId,
            NotificationType.SurveyPublished,
            "notifications.types.surveyPublished.title",
            "notifications.types.surveyPublished.message",
            actionUrl: $"/surveys/{surveyId}",
            actionLabel: "notifications.actions.viewSurvey",
            relatedEntityId: surveyId,
            relatedEntityType: "Survey",
            metadata: System.Text.Json.JsonSerializer.Serialize(new { surveyTitle })
        );
    }

    /// <summary>
    /// Creates a survey milestone notification.
    /// </summary>
    public static Notification CreateSurveyMilestone(
        Guid userId,
        string surveyTitle,
        int responseCount,
        Guid surveyId
    )
    {
        return Create(
            userId,
            NotificationType.SurveyMilestone,
            "notifications.types.surveyMilestone.title",
            "notifications.types.surveyMilestone.message",
            actionUrl: $"/surveys/{surveyId}/responses",
            actionLabel: "notifications.actions.viewResponses",
            relatedEntityId: surveyId,
            relatedEntityType: "Survey",
            metadata: System.Text.Json.JsonSerializer.Serialize(new { surveyTitle, responseCount })
        );
    }

    /// <summary>
    /// Creates a member joined workspace notification.
    /// </summary>
    public static Notification CreateMemberJoined(
        Guid userId,
        string memberName,
        string workspaceName,
        Guid namespaceId
    )
    {
        return Create(
            userId,
            NotificationType.MemberJoined,
            "notifications.types.memberJoined.title",
            "notifications.types.memberJoined.message",
            actionUrl: $"/workspaces/{namespaceId}/settings?tab=members",
            actionLabel: "notifications.actions.viewMembers",
            relatedEntityId: namespaceId,
            relatedEntityType: "Namespace",
            metadata: System.Text.Json.JsonSerializer.Serialize(new { memberName, workspaceName })
        );
    }

    /// <summary>
    /// Creates a system announcement notification.
    /// </summary>
    public static Notification CreateSystemAnnouncement(
        Guid userId,
        string title,
        string message,
        string? actionUrl = null
    )
    {
        return Create(
            userId,
            NotificationType.SystemAnnouncement,
            title,
            message,
            actionUrl: actionUrl,
            actionLabel: actionUrl != null ? "notifications.actions.learnMore" : null
        );
    }

    #endregion
}
