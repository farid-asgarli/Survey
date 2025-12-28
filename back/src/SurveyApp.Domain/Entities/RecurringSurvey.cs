using SurveyApp.Domain.Common;
using SurveyApp.Domain.Enums;

namespace SurveyApp.Domain.Entities;

/// <summary>
/// Represents a recurring survey configuration that automatically sends surveys on a schedule.
/// </summary>
public class RecurringSurvey : AggregateRoot<Guid>
{
    private readonly List<RecurringSurveyRun> _runs = [];
    private string[] _recipientEmails = [];
    private DayOfWeek[] _daysOfWeek = [];

    /// <summary>
    /// Gets the survey ID this recurring configuration belongs to.
    /// </summary>
    public Guid SurveyId { get; private set; }

    /// <summary>
    /// Gets the namespace ID this recurring survey belongs to.
    /// </summary>
    public Guid NamespaceId { get; private set; }

    /// <summary>
    /// Gets the name of this recurring survey configuration.
    /// </summary>
    public string Name { get; private set; } = null!;

    /// <summary>
    /// Gets whether this recurring survey is currently active.
    /// </summary>
    public bool IsActive { get; private set; }

    // Schedule properties

    /// <summary>
    /// Gets the recurrence pattern.
    /// </summary>
    public RecurrencePattern Pattern { get; private set; }

    /// <summary>
    /// Gets the cron expression for custom schedules.
    /// </summary>
    public string? CronExpression { get; private set; }

    /// <summary>
    /// Gets the time of day when the survey should be sent.
    /// </summary>
    public TimeOnly SendTime { get; private set; }

    /// <summary>
    /// Gets the timezone ID for the schedule.
    /// </summary>
    public string TimezoneId { get; private set; } = null!;

    /// <summary>
    /// Gets the days of the week for weekly patterns.
    /// </summary>
    public DayOfWeek[] DaysOfWeek
    {
        get => _daysOfWeek;
        private set => _daysOfWeek = value ?? [];
    }

    /// <summary>
    /// Gets the day of the month for monthly patterns.
    /// </summary>
    public int? DayOfMonth { get; private set; }

    // Audience properties

    /// <summary>
    /// Gets the audience type.
    /// </summary>
    public AudienceType AudienceType { get; private set; }

    /// <summary>
    /// Gets the static list of recipient emails.
    /// </summary>
    public string[] RecipientEmails
    {
        get => _recipientEmails;
        private set => _recipientEmails = value ?? [];
    }

    /// <summary>
    /// Gets the audience list ID for dynamic lists.
    /// </summary>
    public Guid? AudienceListId { get; private set; }

    // Options

    /// <summary>
    /// Gets whether reminders should be sent.
    /// </summary>
    public bool SendReminders { get; private set; }

    /// <summary>
    /// Gets the number of days after sending to send a reminder.
    /// </summary>
    public int ReminderDaysAfter { get; private set; }

    /// <summary>
    /// Gets the maximum number of reminders to send.
    /// </summary>
    public int MaxReminders { get; private set; }

    /// <summary>
    /// Gets the custom email subject.
    /// </summary>
    public string? CustomSubject { get; private set; }

    /// <summary>
    /// Gets the custom email message.
    /// </summary>
    public string? CustomMessage { get; private set; }

    // Tracking

    /// <summary>
    /// Gets the next scheduled run time.
    /// </summary>
    public DateTime? NextRunAt { get; private set; }

    /// <summary>
    /// Gets the last run time.
    /// </summary>
    public DateTime? LastRunAt { get; private set; }

    /// <summary>
    /// Gets the total number of runs executed.
    /// </summary>
    public int TotalRuns { get; private set; }

    /// <summary>
    /// Gets the end date for this recurring survey.
    /// </summary>
    public DateTime? EndsAt { get; private set; }

    /// <summary>
    /// Gets the maximum number of runs allowed.
    /// </summary>
    public int? MaxRuns { get; private set; }

    // Navigation properties

    /// <summary>
    /// Gets the associated survey.
    /// </summary>
    public Survey Survey { get; private set; } = null!;

    /// <summary>
    /// Gets the associated namespace.
    /// </summary>
    public Namespace Namespace { get; private set; } = null!;

    /// <summary>
    /// Gets the collection of runs for this recurring survey.
    /// </summary>
    public IReadOnlyCollection<RecurringSurveyRun> Runs => _runs.AsReadOnly();

    /// <summary>
    /// Private constructor for EF Core.
    /// </summary>
    private RecurringSurvey() { }

    /// <summary>
    /// Creates a new recurring survey configuration.
    /// </summary>
    public static RecurringSurvey Create(
        Guid surveyId,
        Guid namespaceId,
        string name,
        RecurrencePattern pattern,
        TimeOnly sendTime,
        string timezoneId,
        AudienceType audienceType
    )
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Name is required.", nameof(name));

        if (string.IsNullOrWhiteSpace(timezoneId))
            throw new ArgumentException("Timezone ID is required.", nameof(timezoneId));

        var recurringSurvey = new RecurringSurvey
        {
            Id = Guid.NewGuid(),
            SurveyId = surveyId,
            NamespaceId = namespaceId,
            Name = name,
            Pattern = pattern,
            SendTime = sendTime,
            TimezoneId = timezoneId,
            AudienceType = audienceType,
            IsActive = false,
            TotalRuns = 0,
        };

        recurringSurvey.CalculateNextRun();

        return recurringSurvey;
    }

    /// <summary>
    /// Updates the name of this recurring survey.
    /// </summary>
    public void UpdateName(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Name is required.", nameof(name));

        Name = name;
    }

    /// <summary>
    /// Updates the schedule configuration.
    /// </summary>
    public void UpdateSchedule(
        RecurrencePattern pattern,
        TimeOnly sendTime,
        string timezoneId,
        DayOfWeek[]? daysOfWeek = null,
        int? dayOfMonth = null,
        string? cronExpression = null
    )
    {
        if (string.IsNullOrWhiteSpace(timezoneId))
            throw new ArgumentException("Timezone ID is required.", nameof(timezoneId));

        if (pattern == RecurrencePattern.Weekly && (daysOfWeek == null || daysOfWeek.Length == 0))
            throw new ArgumentException(
                "Days of week are required for weekly pattern.",
                nameof(daysOfWeek)
            );

        if (pattern == RecurrencePattern.Monthly && !dayOfMonth.HasValue)
            throw new ArgumentException(
                "Day of month is required for monthly pattern.",
                nameof(dayOfMonth)
            );

        if (pattern == RecurrencePattern.Custom && string.IsNullOrWhiteSpace(cronExpression))
            throw new ArgumentException(
                "Cron expression is required for custom pattern.",
                nameof(cronExpression)
            );

        if (dayOfMonth.HasValue && (dayOfMonth.Value < 1 || dayOfMonth.Value > 31))
            throw new ArgumentException(
                "Day of month must be between 1 and 31.",
                nameof(dayOfMonth)
            );

        Pattern = pattern;
        SendTime = sendTime;
        TimezoneId = timezoneId;
        DaysOfWeek = daysOfWeek ?? [];
        DayOfMonth = dayOfMonth;
        CronExpression = cronExpression;

        CalculateNextRun();
    }

    /// <summary>
    /// Updates the audience configuration.
    /// </summary>
    public void UpdateAudience(
        AudienceType audienceType,
        string[]? recipientEmails = null,
        Guid? audienceListId = null
    )
    {
        if (
            audienceType == AudienceType.StaticList
            && (recipientEmails == null || recipientEmails.Length == 0)
        )
            throw new ArgumentException(
                "Recipient emails are required for static list audience.",
                nameof(recipientEmails)
            );

        if (audienceType == AudienceType.DynamicList && !audienceListId.HasValue)
            throw new ArgumentException(
                "Audience list ID is required for dynamic list audience.",
                nameof(audienceListId)
            );

        AudienceType = audienceType;
        RecipientEmails = recipientEmails ?? [];
        AudienceListId = audienceListId;
    }

    /// <summary>
    /// Updates reminder settings.
    /// </summary>
    public void UpdateReminderSettings(
        bool sendReminders,
        int reminderDaysAfter = 3,
        int maxReminders = 2
    )
    {
        if (reminderDaysAfter < 1)
            throw new ArgumentException(
                "Reminder days must be at least 1.",
                nameof(reminderDaysAfter)
            );

        if (maxReminders < 1)
            throw new ArgumentException("Max reminders must be at least 1.", nameof(maxReminders));

        SendReminders = sendReminders;
        ReminderDaysAfter = reminderDaysAfter;
        MaxReminders = maxReminders;
    }

    /// <summary>
    /// Updates custom email content.
    /// </summary>
    public void UpdateEmailContent(string? customSubject, string? customMessage)
    {
        CustomSubject = customSubject;
        CustomMessage = customMessage;
    }

    /// <summary>
    /// Sets the end conditions for this recurring survey.
    /// </summary>
    public void SetEndConditions(DateTime? endsAt, int? maxRuns)
    {
        if (endsAt.HasValue && endsAt.Value < DateTime.UtcNow)
            throw new ArgumentException("End date must be in the future.", nameof(endsAt));

        if (maxRuns.HasValue && maxRuns.Value < 1)
            throw new ArgumentException("Max runs must be at least 1.", nameof(maxRuns));

        EndsAt = endsAt;
        MaxRuns = maxRuns;
    }

    /// <summary>
    /// Activates this recurring survey.
    /// </summary>
    public void Activate()
    {
        if (IsActive)
            return;

        IsActive = true;
        CalculateNextRun();
    }

    /// <summary>
    /// Pauses this recurring survey.
    /// </summary>
    public void Pause()
    {
        if (!IsActive)
            return;

        IsActive = false;
    }

    /// <summary>
    /// Records a completed run and calculates the next run time.
    /// </summary>
    public RecurringSurveyRun RecordRun(
        int recipientsCount,
        int sentCount,
        int failedCount,
        RunStatus status,
        string? errorMessage = null
    )
    {
        var run = RecurringSurveyRun.Create(
            Id,
            TotalRuns + 1,
            NextRunAt ?? DateTime.UtcNow,
            recipientsCount,
            sentCount,
            failedCount,
            status,
            errorMessage
        );

        _runs.Add(run);
        TotalRuns++;
        LastRunAt = DateTime.UtcNow;

        // Check if we should continue
        if (ShouldContinue())
        {
            CalculateNextRun();
        }
        else
        {
            IsActive = false;
            NextRunAt = null;
        }

        return run;
    }

    /// <summary>
    /// Determines whether the recurring survey should continue running.
    /// </summary>
    private bool ShouldContinue()
    {
        if (!IsActive)
            return false;

        if (EndsAt.HasValue && DateTime.UtcNow >= EndsAt.Value)
            return false;

        if (MaxRuns.HasValue && TotalRuns >= MaxRuns.Value)
            return false;

        return true;
    }

    /// <summary>
    /// Calculates the next run time based on the schedule.
    /// </summary>
    private void CalculateNextRun()
    {
        if (!IsActive && NextRunAt == null)
        {
            // Calculate initial next run for preview purposes
            NextRunAt = CalculateNextRunFromDate(DateTime.UtcNow);
            return;
        }

        var baseDate = LastRunAt ?? DateTime.UtcNow;
        NextRunAt = CalculateNextRunFromDate(baseDate);
    }

    /// <summary>
    /// Calculates the next run time from a base date.
    /// </summary>
    private DateTime? CalculateNextRunFromDate(DateTime baseDate)
    {
        try
        {
            var timeZone = TimeZoneInfo.FindSystemTimeZoneById(TimezoneId);
            var localBaseDate = TimeZoneInfo.ConvertTimeFromUtc(baseDate, timeZone);

            DateTime nextLocalRun = Pattern switch
            {
                RecurrencePattern.Daily => CalculateDailyNextRun(localBaseDate),
                RecurrencePattern.Weekly => CalculateWeeklyNextRun(localBaseDate),
                RecurrencePattern.BiWeekly => CalculateBiWeeklyNextRun(localBaseDate),
                RecurrencePattern.Monthly => CalculateMonthlyNextRun(localBaseDate),
                RecurrencePattern.Quarterly => CalculateQuarterlyNextRun(localBaseDate),
                RecurrencePattern.Custom => CalculateCustomNextRun(localBaseDate),
                _ => throw new InvalidOperationException($"Unknown recurrence pattern: {Pattern}"),
            };

            return TimeZoneInfo.ConvertTimeToUtc(nextLocalRun, timeZone);
        }
        catch (TimeZoneNotFoundException)
        {
            // Fallback to UTC if timezone is not found
            return CalculateDailyNextRun(baseDate);
        }
    }

    private DateTime CalculateDailyNextRun(DateTime baseDate)
    {
        var nextRun = new DateTime(
            baseDate.Year,
            baseDate.Month,
            baseDate.Day,
            SendTime.Hour,
            SendTime.Minute,
            0
        );
        if (nextRun <= baseDate)
            nextRun = nextRun.AddDays(1);
        return nextRun;
    }

    private DateTime CalculateWeeklyNextRun(DateTime baseDate)
    {
        if (DaysOfWeek.Length == 0)
            return CalculateDailyNextRun(baseDate);

        var nextRun = new DateTime(
            baseDate.Year,
            baseDate.Month,
            baseDate.Day,
            SendTime.Hour,
            SendTime.Minute,
            0
        );

        // Find the next valid day
        for (int i = 0; i <= 14; i++) // Check up to 2 weeks
        {
            var checkDate = nextRun.AddDays(i);
            if (DaysOfWeek.Contains(checkDate.DayOfWeek) && checkDate > baseDate)
                return checkDate;
        }

        return nextRun.AddDays(7); // Fallback
    }

    private DateTime CalculateBiWeeklyNextRun(DateTime baseDate)
    {
        var nextRun = new DateTime(
            baseDate.Year,
            baseDate.Month,
            baseDate.Day,
            SendTime.Hour,
            SendTime.Minute,
            0
        );
        if (nextRun <= baseDate)
            nextRun = nextRun.AddDays(14);
        else
            nextRun = nextRun.AddDays(14 - (int)(nextRun - baseDate).TotalDays % 14);
        return nextRun;
    }

    private DateTime CalculateMonthlyNextRun(DateTime baseDate)
    {
        var day = DayOfMonth ?? 1;
        var nextRun = new DateTime(
            baseDate.Year,
            baseDate.Month,
            Math.Min(day, DateTime.DaysInMonth(baseDate.Year, baseDate.Month)),
            SendTime.Hour,
            SendTime.Minute,
            0
        );

        if (nextRun <= baseDate)
        {
            var nextMonth = baseDate.AddMonths(1);
            nextRun = new DateTime(
                nextMonth.Year,
                nextMonth.Month,
                Math.Min(day, DateTime.DaysInMonth(nextMonth.Year, nextMonth.Month)),
                SendTime.Hour,
                SendTime.Minute,
                0
            );
        }

        return nextRun;
    }

    private DateTime CalculateQuarterlyNextRun(DateTime baseDate)
    {
        var nextRun = new DateTime(
            baseDate.Year,
            baseDate.Month,
            1,
            SendTime.Hour,
            SendTime.Minute,
            0
        );
        if (nextRun <= baseDate)
            nextRun = nextRun.AddMonths(3);
        else
            nextRun = nextRun.AddMonths(3 - (baseDate.Month - 1) % 3);
        return nextRun;
    }

    private DateTime CalculateCustomNextRun(DateTime baseDate)
    {
        // For custom cron expressions, a proper cron parser would be needed
        // This is a simplified fallback
        return CalculateDailyNextRun(baseDate);
    }
}
