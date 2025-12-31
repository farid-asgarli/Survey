using SurveyApp.Domain.Entities;

namespace SurveyApp.Domain.Interfaces;

/// <summary>
/// Repository interface for SurveyLink entities.
/// </summary>
public interface ISurveyLinkRepository
{
    /// <summary>
    /// Gets a survey link by its ID (read-only, no change tracking).
    /// </summary>
    Task<SurveyLink?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a survey link by its ID with change tracking enabled for updates.
    /// </summary>
    Task<SurveyLink?> GetByIdForUpdateAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a survey link by its ID with clicks loaded.
    /// </summary>
    Task<SurveyLink?> GetByIdWithClicksAsync(
        Guid id,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Gets a survey link by its token.
    /// </summary>
    Task<SurveyLink?> GetByTokenAsync(string token, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets all survey links for a survey.
    /// </summary>
    Task<IReadOnlyList<SurveyLink>> GetBySurveyIdAsync(
        Guid surveyId,
        bool? isActive = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Adds a new survey link.
    /// </summary>
    Task AddAsync(SurveyLink link, CancellationToken cancellationToken = default);

    /// <summary>
    /// Adds multiple survey links.
    /// </summary>
    Task AddRangeAsync(
        IEnumerable<SurveyLink> links,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Updates an existing survey link.
    /// </summary>
    void Update(SurveyLink link);

    /// <summary>
    /// Deletes a survey link.
    /// </summary>
    void Delete(SurveyLink link);

    /// <summary>
    /// Adds a click record for a survey link.
    /// </summary>
    Task AddClickAsync(LinkClick click, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets clicks for a survey link within a date range.
    /// </summary>
    Task<IReadOnlyList<LinkClick>> GetClicksAsync(
        Guid surveyLinkId,
        DateTime? startDate = null,
        DateTime? endDate = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Associates a click with a response.
    /// </summary>
    Task AssociateClickWithResponseAsync(
        Guid clickId,
        Guid responseId,
        CancellationToken cancellationToken = default
    );
}
