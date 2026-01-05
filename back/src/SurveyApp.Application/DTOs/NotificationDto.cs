using SurveyApp.Domain.Enums;

namespace SurveyApp.Application.DTOs;

/// <summary>
/// DTO for notification data.
/// </summary>
public class NotificationDto
{
    public Guid Id { get; set; }
    public NotificationType Type { get; set; }
    public string Title { get; set; } = null!;
    public string Message { get; set; } = null!;
    public string? ActionUrl { get; set; }
    public string? ActionLabel { get; set; }
    public bool IsRead { get; set; }
    public DateTime? ReadAt { get; set; }
    public Guid? RelatedEntityId { get; set; }
    public string? RelatedEntityType { get; set; }
    public Dictionary<string, object>? Metadata { get; set; }
    public DateTime CreatedAt { get; set; }
}

/// <summary>
/// DTO for notification count summary.
/// </summary>
public class NotificationCountDto
{
    public int UnreadCount { get; set; }
    public int TotalCount { get; set; }
}

/// <summary>
/// DTO for notification preferences.
/// </summary>
public class NotificationPreferencesDto
{
    public bool EmailNotifications { get; set; }
    public bool NewResponses { get; set; }
    public bool SurveyMilestones { get; set; }
    public bool TeamActivity { get; set; }
    public bool WeeklyDigest { get; set; }
    public bool ProductUpdates { get; set; }
    public bool SecurityAlerts { get; set; }
}
