using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Domain.Entities;
using SurveyApp.Domain.Enums;

namespace SurveyApp.Application.Features.RecurringSurveys.Commands.UpdateRecurringSurvey;

/// <summary>
/// Command to update an existing recurring survey.
/// </summary>
public record UpdateRecurringSurveyCommand : IRequest<Result<RecurringSurveyDto>>, INamespaceCommand
{
    /// <summary>
    /// The permission required to execute this command.
    /// </summary>
    public static NamespacePermission RequiredPermission => NamespacePermission.EditSurveys;

    /// <summary>
    /// The recurring survey ID to update.
    /// </summary>
    public Guid Id { get; init; }

    /// <summary>
    /// The name of this recurring survey configuration.
    /// </summary>
    public string Name { get; init; } = string.Empty;

    // Schedule
    public RecurrencePattern Pattern { get; init; }
    public string? CronExpression { get; init; }
    public TimeOnly SendTime { get; init; }
    public string TimezoneId { get; init; } = "UTC";
    public DayOfWeek[]? DaysOfWeek { get; init; }
    public int? DayOfMonth { get; init; }

    // Audience
    public AudienceType AudienceType { get; init; }
    public string[]? RecipientEmails { get; init; }
    public Guid? AudienceListId { get; init; }

    // Options
    public bool SendReminders { get; init; }
    public int ReminderDaysAfter { get; init; } = 3;
    public int MaxReminders { get; init; } = 2;
    public string? CustomSubject { get; init; }
    public string? CustomMessage { get; init; }

    // End conditions
    public DateTime? EndsAt { get; init; }
    public int? MaxRuns { get; init; }
}
