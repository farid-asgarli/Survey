namespace SurveyApp.Domain.Enums;

/// <summary>
/// Types of notifications that can be sent to users.
/// </summary>
public enum NotificationType
{
    /// <summary>
    /// General system notification.
    /// </summary>
    System = 0,

    /// <summary>
    /// User was invited to a workspace.
    /// </summary>
    WorkspaceInvitation = 1,

    /// <summary>
    /// A new response was submitted to user's survey.
    /// </summary>
    NewResponse = 2,

    /// <summary>
    /// A survey was published.
    /// </summary>
    SurveyPublished = 3,

    /// <summary>
    /// Survey reached a response milestone (e.g., 100 responses).
    /// </summary>
    SurveyMilestone = 4,

    /// <summary>
    /// A member joined a workspace the user owns/manages.
    /// </summary>
    MemberJoined = 5,

    /// <summary>
    /// A member left a workspace the user owns/manages.
    /// </summary>
    MemberLeft = 6,

    /// <summary>
    /// Weekly or daily digest summary.
    /// </summary>
    Digest = 7,

    /// <summary>
    /// Email distribution completed.
    /// </summary>
    DistributionComplete = 8,

    /// <summary>
    /// Survey link expired or is about to expire.
    /// </summary>
    LinkExpiration = 9,

    /// <summary>
    /// System announcement or product update.
    /// </summary>
    SystemAnnouncement = 10,

    /// <summary>
    /// Security-related notification (login from new device, etc.).
    /// </summary>
    Security = 11,

    /// <summary>
    /// User's role was changed in a workspace.
    /// </summary>
    RoleChanged = 12,

    /// <summary>
    /// Recurring survey was executed.
    /// </summary>
    RecurringSurveyRun = 13,
}
