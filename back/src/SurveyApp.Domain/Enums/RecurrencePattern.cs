namespace SurveyApp.Domain.Enums;

/// <summary>
/// Defines the recurrence pattern for recurring surveys.
/// </summary>
public enum RecurrencePattern
{
    /// <summary>
    /// Survey is sent every day.
    /// </summary>
    Daily,

    /// <summary>
    /// Survey is sent every week on specified days.
    /// </summary>
    Weekly,

    /// <summary>
    /// Survey is sent every two weeks.
    /// </summary>
    BiWeekly,

    /// <summary>
    /// Survey is sent every month.
    /// </summary>
    Monthly,

    /// <summary>
    /// Survey is sent every quarter (3 months).
    /// </summary>
    Quarterly,

    /// <summary>
    /// Custom schedule using cron expression.
    /// </summary>
    Custom,
}
