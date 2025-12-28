using SurveyApp.Domain.Entities;

namespace SurveyApp.Domain.Interfaces;

/// <summary>
/// Repository interface for RecurringSurvey entities.
/// </summary>
public interface IRecurringSurveyRepository
{
    /// <summary>
    /// Gets a recurring survey by its ID.
    /// </summary>
    Task<RecurringSurvey?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a recurring survey by ID with runs loaded.
    /// </summary>
    Task<RecurringSurvey?> GetByIdWithRunsAsync(
        Guid id,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Gets all recurring surveys for a namespace.
    /// </summary>
    Task<IReadOnlyList<RecurringSurvey>> GetByNamespaceIdAsync(
        Guid namespaceId,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Gets all recurring surveys for a specific survey.
    /// </summary>
    Task<IReadOnlyList<RecurringSurvey>> GetBySurveyIdAsync(
        Guid surveyId,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Gets all active recurring surveys that are due to run.
    /// </summary>
    Task<IReadOnlyList<RecurringSurvey>> GetDueForExecutionAsync(
        DateTime asOfTime,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Gets paginated recurring surveys for a namespace.
    /// </summary>
    Task<(IReadOnlyList<RecurringSurvey> Items, int TotalCount)> GetPagedAsync(
        Guid namespaceId,
        int pageNumber,
        int pageSize,
        string? searchTerm = null,
        bool? isActive = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Gets upcoming runs for all active recurring surveys in a namespace.
    /// </summary>
    Task<IReadOnlyList<RecurringSurvey>> GetUpcomingRunsAsync(
        Guid namespaceId,
        int count,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Gets runs for a specific recurring survey.
    /// </summary>
    Task<(IReadOnlyList<RecurringSurveyRun> Items, int TotalCount)> GetRunsPagedAsync(
        Guid recurringSurveyId,
        int pageNumber,
        int pageSize,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Gets a specific run by ID.
    /// </summary>
    Task<RecurringSurveyRun?> GetRunByIdAsync(
        Guid runId,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Adds a new recurring survey.
    /// </summary>
    Task AddAsync(RecurringSurvey recurringSurvey, CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates an existing recurring survey.
    /// </summary>
    Task UpdateAsync(
        RecurringSurvey recurringSurvey,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Deletes a recurring survey.
    /// </summary>
    Task DeleteAsync(
        RecurringSurvey recurringSurvey,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Adds a run to the database.
    /// </summary>
    Task AddRunAsync(RecurringSurveyRun run, CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates a run.
    /// </summary>
    Task UpdateRunAsync(RecurringSurveyRun run, CancellationToken cancellationToken = default);
}
