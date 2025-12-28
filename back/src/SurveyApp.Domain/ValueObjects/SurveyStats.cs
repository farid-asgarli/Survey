using SurveyApp.Domain.Common;

namespace SurveyApp.Domain.ValueObjects;

/// <summary>
/// Represents calculated statistics for a survey.
/// </summary>
public sealed class SurveyStats : ValueObject
{
    /// <summary>
    /// Gets the total number of responses.
    /// </summary>
    public int TotalResponses { get; }

    /// <summary>
    /// Gets the number of completed responses.
    /// </summary>
    public int CompletedResponses { get; }

    /// <summary>
    /// Gets the number of partial (incomplete) responses.
    /// </summary>
    public int PartialResponses { get; }

    /// <summary>
    /// Gets the completion rate as a percentage.
    /// </summary>
    public decimal CompletionRate { get; }

    /// <summary>
    /// Gets the average time spent on the survey in seconds.
    /// </summary>
    public double AverageTimeSpentSeconds { get; }

    /// <summary>
    /// Gets the date of the first response.
    /// </summary>
    public DateTime? FirstResponseAt { get; }

    /// <summary>
    /// Gets the date of the last response.
    /// </summary>
    public DateTime? LastResponseAt { get; }

    private SurveyStats(
        int totalResponses,
        int completedResponses,
        int partialResponses,
        decimal completionRate,
        double averageTimeSpentSeconds,
        DateTime? firstResponseAt,
        DateTime? lastResponseAt
    )
    {
        TotalResponses = totalResponses;
        CompletedResponses = completedResponses;
        PartialResponses = partialResponses;
        CompletionRate = completionRate;
        AverageTimeSpentSeconds = averageTimeSpentSeconds;
        FirstResponseAt = firstResponseAt;
        LastResponseAt = lastResponseAt;
    }

    /// <summary>
    /// Creates survey statistics with the given values.
    /// </summary>
    public static SurveyStats Create(
        int totalResponses,
        int completedResponses,
        double averageTimeSpentSeconds,
        DateTime? firstResponseAt,
        DateTime? lastResponseAt
    )
    {
        var partialResponses = totalResponses - completedResponses;
        var completionRate =
            totalResponses > 0
                ? Math.Round((decimal)completedResponses / totalResponses * 100, 2)
                : 0;

        return new SurveyStats(
            totalResponses,
            completedResponses,
            partialResponses,
            completionRate,
            averageTimeSpentSeconds,
            firstResponseAt,
            lastResponseAt
        );
    }

    /// <summary>
    /// Creates empty statistics.
    /// </summary>
    public static SurveyStats Empty()
    {
        return new SurveyStats(0, 0, 0, 0, 0, null, null);
    }

    protected override IEnumerable<object?> GetEqualityComponents()
    {
        yield return TotalResponses;
        yield return CompletedResponses;
        yield return PartialResponses;
        yield return CompletionRate;
        yield return AverageTimeSpentSeconds;
        yield return FirstResponseAt;
        yield return LastResponseAt;
    }
}
