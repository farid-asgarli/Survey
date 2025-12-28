using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Domain.Entities;
using SurveyApp.Domain.Enums;

namespace SurveyApp.Application.Features.RecurringSurveys.Commands.CreateRecurringSurvey;

/// <summary>
/// Command to create a new recurring survey.
/// </summary>
public record CreateRecurringSurveyCommand : IRequest<Result<RecurringSurveyDto>>, INamespaceCommand
{
    /// <summary>
    /// The permission required to execute this command.
    /// </summary>
    public static NamespacePermission RequiredPermission => NamespacePermission.EditSurveys;

    /// <summary>
    /// The survey ID to create a recurring schedule for.
    /// </summary>
    public Guid SurveyId { get; init; }

    /// <summary>
    /// The name of this recurring survey configuration.
    /// </summary>
    public string Name { get; init; } = string.Empty;

    // Schedule
    /// <summary>
    /// The recurrence pattern.
    /// </summary>
    public RecurrencePattern Pattern { get; init; }

    /// <summary>
    /// The cron expression for custom schedules.
    /// </summary>
    public string? CronExpression { get; init; }

    /// <summary>
    /// The time of day to send the survey.
    /// </summary>
    public TimeOnly SendTime { get; init; }

    /// <summary>
    /// The timezone ID for the schedule.
    /// </summary>
    public string TimezoneId { get; init; } = "UTC";

    /// <summary>
    /// The days of the week for weekly patterns.
    /// </summary>
    public DayOfWeek[]? DaysOfWeek { get; init; }

    /// <summary>
    /// The day of the month for monthly patterns.
    /// </summary>
    public int? DayOfMonth { get; init; }

    // Audience
    /// <summary>
    /// The audience type.
    /// </summary>
    public AudienceType AudienceType { get; init; }

    /// <summary>
    /// The recipient emails for static list audience.
    /// </summary>
    public string[]? RecipientEmails { get; init; }

    /// <summary>
    /// The audience list ID for dynamic list audience.
    /// </summary>
    public Guid? AudienceListId { get; init; }

    // Options
    /// <summary>
    /// Whether to send reminders.
    /// </summary>
    public bool SendReminders { get; init; }

    /// <summary>
    /// Days after sending to send a reminder.
    /// </summary>
    public int ReminderDaysAfter { get; init; } = 3;

    /// <summary>
    /// Maximum number of reminders.
    /// </summary>
    public int MaxReminders { get; init; } = 2;

    /// <summary>
    /// Custom email subject.
    /// </summary>
    public string? CustomSubject { get; init; }

    /// <summary>
    /// Custom email message.
    /// </summary>
    public string? CustomMessage { get; init; }

    // End conditions
    /// <summary>
    /// When to stop sending surveys.
    /// </summary>
    public DateTime? EndsAt { get; init; }

    /// <summary>
    /// Maximum number of runs.
    /// </summary>
    public int? MaxRuns { get; init; }

    /// <summary>
    /// Whether to activate immediately.
    /// </summary>
    public bool ActivateImmediately { get; init; }
}
