using SurveyApp.Domain.Common;
using SurveyApp.Domain.Enums;

namespace SurveyApp.Domain.Entities;

/// <summary>
/// Represents a single execution/run of a recurring survey.
/// </summary>
public class RecurringSurveyRun : Entity<Guid>
{
    /// <summary>
    /// Gets the recurring survey ID this run belongs to.
    /// </summary>
    public Guid RecurringSurveyId { get; private set; }

    /// <summary>
    /// Gets the run number (sequential).
    /// </summary>
    public int RunNumber { get; private set; }

    /// <summary>
    /// Gets the scheduled execution time.
    /// </summary>
    public DateTime ScheduledAt { get; private set; }

    /// <summary>
    /// Gets the actual start time.
    /// </summary>
    public DateTime? StartedAt { get; private set; }

    /// <summary>
    /// Gets the completion time.
    /// </summary>
    public DateTime? CompletedAt { get; private set; }

    /// <summary>
    /// Gets the status of this run.
    /// </summary>
    public RunStatus Status { get; private set; }

    /// <summary>
    /// Gets the total number of recipients.
    /// </summary>
    public int RecipientsCount { get; private set; }

    /// <summary>
    /// Gets the number of successfully sent emails.
    /// </summary>
    public int SentCount { get; private set; }

    /// <summary>
    /// Gets the number of failed email deliveries.
    /// </summary>
    public int FailedCount { get; private set; }

    /// <summary>
    /// Gets the number of responses received for this run.
    /// </summary>
    public int ResponsesCount { get; private set; }

    /// <summary>
    /// Gets the error message if the run failed.
    /// </summary>
    public string? ErrorMessage { get; private set; }

    /// <summary>
    /// Gets the duration of the run in milliseconds.
    /// </summary>
    public long DurationMs { get; private set; }

    // Navigation properties

    /// <summary>
    /// Gets the parent recurring survey.
    /// </summary>
    public RecurringSurvey RecurringSurvey { get; private set; } = null!;

    /// <summary>
    /// Private constructor for EF Core.
    /// </summary>
    private RecurringSurveyRun() { }

    /// <summary>
    /// Creates a new recurring survey run.
    /// </summary>
    public static RecurringSurveyRun Create(
        Guid recurringSurveyId,
        int runNumber,
        DateTime scheduledAt,
        int recipientsCount,
        int sentCount,
        int failedCount,
        RunStatus status,
        string? errorMessage = null
    )
    {
        return new RecurringSurveyRun
        {
            Id = Guid.NewGuid(),
            RecurringSurveyId = recurringSurveyId,
            RunNumber = runNumber,
            ScheduledAt = scheduledAt,
            RecipientsCount = recipientsCount,
            SentCount = sentCount,
            FailedCount = failedCount,
            Status = status,
            ErrorMessage = errorMessage,
            CompletedAt = DateTime.UtcNow,
        };
    }

    /// <summary>
    /// Creates a scheduled run that hasn't started yet.
    /// </summary>
    public static RecurringSurveyRun CreateScheduled(
        Guid recurringSurveyId,
        int runNumber,
        DateTime scheduledAt
    )
    {
        return new RecurringSurveyRun
        {
            Id = Guid.NewGuid(),
            RecurringSurveyId = recurringSurveyId,
            RunNumber = runNumber,
            ScheduledAt = scheduledAt,
            Status = RunStatus.Scheduled,
            RecipientsCount = 0,
            SentCount = 0,
            FailedCount = 0,
            ResponsesCount = 0,
        };
    }

    /// <summary>
    /// Marks the run as started.
    /// </summary>
    public void Start()
    {
        if (Status != RunStatus.Scheduled)
            throw new InvalidOperationException("Domain.RecurringSurvey.CanOnlyStartScheduled");

        Status = RunStatus.Running;
        StartedAt = DateTime.UtcNow;
    }

    /// <summary>
    /// Completes the run with the given results.
    /// </summary>
    public void Complete(int recipientsCount, int sentCount, int failedCount)
    {
        if (Status != RunStatus.Running)
            throw new InvalidOperationException("Domain.RecurringSurvey.CanOnlyCompleteRunning");

        RecipientsCount = recipientsCount;
        SentCount = sentCount;
        FailedCount = failedCount;
        CompletedAt = DateTime.UtcNow;

        if (StartedAt.HasValue)
            DurationMs = (long)(CompletedAt.Value - StartedAt.Value).TotalMilliseconds;

        Status =
            failedCount > 0
                ? (sentCount > 0 ? RunStatus.PartiallyCompleted : RunStatus.Failed)
                : RunStatus.Completed;
    }

    /// <summary>
    /// Marks the run as failed.
    /// </summary>
    public void Fail(string errorMessage)
    {
        Status = RunStatus.Failed;
        ErrorMessage = errorMessage;
        CompletedAt = DateTime.UtcNow;

        if (StartedAt.HasValue)
            DurationMs = (long)(CompletedAt.Value - StartedAt.Value).TotalMilliseconds;
    }

    /// <summary>
    /// Cancels a scheduled run.
    /// </summary>
    public void Cancel()
    {
        if (Status != RunStatus.Scheduled)
            throw new InvalidOperationException("Domain.RecurringSurvey.CanOnlyCancelScheduled");

        Status = RunStatus.Cancelled;
    }

    /// <summary>
    /// Increments the response count.
    /// </summary>
    public void IncrementResponseCount()
    {
        ResponsesCount++;
    }
}
