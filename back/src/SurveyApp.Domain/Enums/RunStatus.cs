namespace SurveyApp.Domain.Enums;

/// <summary>
/// Defines the status of a recurring survey run.
/// </summary>
public enum RunStatus
{
    /// <summary>
    /// Run is scheduled to execute.
    /// </summary>
    Scheduled,

    /// <summary>
    /// Run is currently executing.
    /// </summary>
    Running,

    /// <summary>
    /// Run completed successfully.
    /// </summary>
    Completed,

    /// <summary>
    /// Run completed with some failures.
    /// </summary>
    PartiallyCompleted,

    /// <summary>
    /// Run failed completely.
    /// </summary>
    Failed,

    /// <summary>
    /// Run was cancelled.
    /// </summary>
    Cancelled,
}
