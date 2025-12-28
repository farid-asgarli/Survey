using SurveyApp.Application.DTOs;

namespace SurveyApp.Application.Services;

/// <summary>
/// Service for calculating and managing Net Promoter Score (NPS) metrics.
/// </summary>
public interface INpsService
{
    /// <summary>
    /// Calculates the NPS score for an entire survey.
    /// </summary>
    /// <param name="surveyId">The survey ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The NPS score for the survey.</returns>
    Task<SurveyNpsSummaryDto> CalculateNpsAsync(
        Guid surveyId,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Calculates the NPS score for a specific question.
    /// </summary>
    /// <param name="questionId">The question ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The NPS score for the question.</returns>
    Task<NpsScoreDto> CalculateNpsForQuestionAsync(
        Guid questionId,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Gets the NPS trend over a specified date range.
    /// </summary>
    /// <param name="surveyId">The survey ID.</param>
    /// <param name="fromDate">Start date of the range.</param>
    /// <param name="toDate">End date of the range.</param>
    /// <param name="groupBy">The grouping interval (Day, Week, Month).</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The NPS trend data.</returns>
    Task<NpsTrendDto> GetNpsTrendAsync(
        Guid surveyId,
        DateTime fromDate,
        DateTime toDate,
        NpsTrendGroupBy groupBy = NpsTrendGroupBy.Week,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Gets NPS scores segmented by a specified criteria.
    /// </summary>
    /// <param name="surveyId">The survey ID.</param>
    /// <param name="segmentBy">The criteria to segment by.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The segmented NPS data.</returns>
    Task<NpsBySegmentDto> GetNpsBySegmentAsync(
        Guid surveyId,
        NpsSegmentBy segmentBy,
        CancellationToken cancellationToken = default
    );
}

/// <summary>
/// Defines how NPS trend data should be grouped.
/// </summary>
public enum NpsTrendGroupBy
{
    /// <summary>
    /// Group by day.
    /// </summary>
    Day,

    /// <summary>
    /// Group by week.
    /// </summary>
    Week,

    /// <summary>
    /// Group by month.
    /// </summary>
    Month,
}

/// <summary>
/// Defines criteria for segmenting NPS data.
/// </summary>
public enum NpsSegmentBy
{
    /// <summary>
    /// Segment by response date.
    /// </summary>
    Date,

    /// <summary>
    /// Segment by question.
    /// </summary>
    Question,

    /// <summary>
    /// Segment by completion status.
    /// </summary>
    CompletionStatus,
}
