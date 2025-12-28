namespace SurveyApp.Domain.Enums;

/// <summary>
/// Represents the status of an email distribution.
/// </summary>
public enum DistributionStatus
{
    /// <summary>
    /// Distribution is saved as draft.
    /// </summary>
    Draft,

    /// <summary>
    /// Distribution is scheduled for future delivery.
    /// </summary>
    Scheduled,

    /// <summary>
    /// Distribution is currently being sent.
    /// </summary>
    Sending,

    /// <summary>
    /// Distribution has been fully sent.
    /// </summary>
    Sent,

    /// <summary>
    /// Some emails failed to send.
    /// </summary>
    PartiallyFailed,

    /// <summary>
    /// Distribution completely failed.
    /// </summary>
    Failed,

    /// <summary>
    /// Distribution was cancelled.
    /// </summary>
    Cancelled,
}
