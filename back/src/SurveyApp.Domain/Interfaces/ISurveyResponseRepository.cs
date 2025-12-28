using SurveyApp.Domain.Entities;

namespace SurveyApp.Domain.Interfaces;

/// <summary>
/// Repository interface for SurveyResponse entities.
/// </summary>
public interface ISurveyResponseRepository
{
    /// <summary>
    /// Gets a response by its ID.
    /// </summary>
    Task<SurveyResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a response with its answers.
    /// </summary>
    Task<SurveyResponse?> GetWithAnswersAsync(
        Guid id,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Gets a response by its ID with answers loaded.
    /// </summary>
    Task<SurveyResponse?> GetByIdWithAnswersAsync(
        Guid id,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Gets all responses for a survey.
    /// </summary>
    Task<IReadOnlyList<SurveyResponse>> GetBySurveyIdAsync(
        Guid surveyId,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Gets completed responses for a survey.
    /// </summary>
    Task<IReadOnlyList<SurveyResponse>> GetCompletedBySurveyIdAsync(
        Guid surveyId,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Gets paginated responses for a survey.
    /// </summary>
    Task<(IReadOnlyList<SurveyResponse> Items, int TotalCount)> GetPagedBySurveyIdAsync(
        Guid surveyId,
        int pageNumber,
        int pageSize,
        bool completedOnly = false,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Gets paginated responses for a survey with additional filters.
    /// </summary>
    Task<(IReadOnlyList<SurveyResponse> Items, int TotalCount)> GetPagedAsync(
        Guid surveyId,
        int pageNumber,
        int pageSize,
        bool? isCompleted = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Gets the response count for a survey.
    /// </summary>
    Task<int> GetResponseCountAsync(Guid surveyId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets response count for a survey.
    /// </summary>
    Task<int> GetCountBySurveyIdAsync(
        Guid surveyId,
        bool completedOnly = false,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Gets responses by respondent email.
    /// </summary>
    Task<IReadOnlyList<SurveyResponse>> GetByRespondentEmailAsync(
        Guid surveyId,
        string email,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Checks if a respondent has already submitted a response.
    /// </summary>
    Task<bool> HasRespondedAsync(
        Guid surveyId,
        string email,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Gets analytics data for a survey.
    /// </summary>
    Task<SurveyAnalyticsData> GetAnalyticsDataAsync(
        Guid surveyId,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Adds a new response.
    /// </summary>
    Task<SurveyResponse> AddAsync(
        SurveyResponse response,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Updates an existing response.
    /// </summary>
    void Update(SurveyResponse response);

    /// <summary>
    /// Deletes a response.
    /// </summary>
    void Delete(SurveyResponse response);
}

/// <summary>
/// Analytics data for a survey.
/// </summary>
public class SurveyAnalyticsData
{
    public int TotalResponses { get; set; }
    public int CompletedResponses { get; set; }
    public int PartialResponses { get; set; }
    public double AverageTimeSpentSeconds { get; set; }
    public DateTime? FirstResponseAt { get; set; }
    public DateTime? LastResponseAt { get; set; }
    public Dictionary<DateTime, int> ResponsesByDate { get; set; } = [];
    public Dictionary<Guid, List<string>> AnswersByQuestion { get; set; } = [];
}
