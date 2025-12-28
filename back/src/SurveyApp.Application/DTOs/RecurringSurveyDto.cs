using SurveyApp.Domain.Enums;

namespace SurveyApp.Application.DTOs;

/// <summary>
/// DTO for recurring survey data.
/// </summary>
public class RecurringSurveyDto
{
    public Guid Id { get; set; }
    public Guid SurveyId { get; set; }
    public string SurveyTitle { get; set; } = null!;
    public Guid NamespaceId { get; set; }
    public string Name { get; set; } = null!;
    public bool IsActive { get; set; }

    // Schedule
    public RecurrencePattern Pattern { get; set; }
    public string? CronExpression { get; set; }
    public TimeOnly SendTime { get; set; }
    public string TimezoneId { get; set; } = null!;
    public DayOfWeek[]? DaysOfWeek { get; set; }
    public int? DayOfMonth { get; set; }

    // Audience
    public AudienceType AudienceType { get; set; }
    public string[]? RecipientEmails { get; set; }
    public Guid? AudienceListId { get; set; }
    public int RecipientCount { get; set; }

    // Options
    public bool SendReminders { get; set; }
    public int ReminderDaysAfter { get; set; }
    public int MaxReminders { get; set; }
    public string? CustomSubject { get; set; }
    public string? CustomMessage { get; set; }

    // Tracking
    public DateTime? NextRunAt { get; set; }
    public DateTime? LastRunAt { get; set; }
    public int TotalRuns { get; set; }
    public DateTime? EndsAt { get; set; }
    public int? MaxRuns { get; set; }

    // Audit
    public DateTime CreatedAt { get; set; }
    public Guid? CreatedBy { get; set; }
}

/// <summary>
/// DTO for recurring survey list item (summary).
/// </summary>
public class RecurringSurveyListItemDto
{
    public Guid Id { get; set; }
    public Guid SurveyId { get; set; }
    public string SurveyTitle { get; set; } = null!;
    public string Name { get; set; } = null!;
    public bool IsActive { get; set; }
    public RecurrencePattern Pattern { get; set; }
    public DateTime? NextRunAt { get; set; }
    public DateTime? LastRunAt { get; set; }
    public int TotalRuns { get; set; }
    public int RecipientCount { get; set; }
    public DateTime CreatedAt { get; set; }
}

/// <summary>
/// DTO for recurring survey run data.
/// </summary>
public class RecurringSurveyRunDto
{
    public Guid Id { get; set; }
    public Guid RecurringSurveyId { get; set; }
    public int RunNumber { get; set; }
    public DateTime ScheduledAt { get; set; }
    public DateTime? StartedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public RunStatus Status { get; set; }
    public int RecipientsCount { get; set; }
    public int SentCount { get; set; }
    public int FailedCount { get; set; }
    public int ResponsesCount { get; set; }
    public string? ErrorMessage { get; set; }
    public long DurationMs { get; set; }
}

/// <summary>
/// DTO for upcoming runs preview.
/// </summary>
public class UpcomingRunDto
{
    public Guid RecurringSurveyId { get; set; }
    public string RecurringSurveyName { get; set; } = null!;
    public string SurveyTitle { get; set; } = null!;
    public DateTime ScheduledAt { get; set; }
    public int EstimatedRecipients { get; set; }
}

/// <summary>
/// DTO for schedule configuration.
/// </summary>
public class ScheduleConfigDto
{
    public RecurrencePattern Pattern { get; set; }
    public string? CronExpression { get; set; }
    public TimeOnly SendTime { get; set; }
    public string TimezoneId { get; set; } = null!;
    public DayOfWeek[]? DaysOfWeek { get; set; }
    public int? DayOfMonth { get; set; }
}

/// <summary>
/// DTO for audience configuration.
/// </summary>
public class AudienceConfigDto
{
    public AudienceType AudienceType { get; set; }
    public string[]? RecipientEmails { get; set; }
    public Guid? AudienceListId { get; set; }
}

/// <summary>
/// DTO for reminder settings.
/// </summary>
public class ReminderSettingsDto
{
    public bool SendReminders { get; set; }
    public int ReminderDaysAfter { get; set; }
    public int MaxReminders { get; set; }
}

/// <summary>
/// DTO for recurring survey statistics.
/// </summary>
public class RecurringSurveyStatsDto
{
    public Guid RecurringSurveyId { get; set; }
    public int TotalRuns { get; set; }
    public int SuccessfulRuns { get; set; }
    public int FailedRuns { get; set; }
    public int TotalEmailsSent { get; set; }
    public int TotalResponses { get; set; }
    public decimal AverageResponseRate { get; set; }
    public DateTime? LastRunAt { get; set; }
    public DateTime? NextRunAt { get; set; }
}
