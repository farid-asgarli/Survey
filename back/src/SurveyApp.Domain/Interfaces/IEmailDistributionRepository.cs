using SurveyApp.Domain.Entities;
using SurveyApp.Domain.Enums;

namespace SurveyApp.Domain.Interfaces;

/// <summary>
/// Repository interface for EmailDistribution entities.
/// </summary>
public interface IEmailDistributionRepository
{
    /// <summary>
    /// Gets a distribution by its ID (read-only, no change tracking).
    /// </summary>
    Task<EmailDistribution?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a distribution by its ID with change tracking enabled for updates.
    /// </summary>
    Task<EmailDistribution?> GetByIdForUpdateAsync(
        Guid id,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Gets a distribution by its ID including recipients.
    /// </summary>
    Task<EmailDistribution?> GetByIdWithRecipientsAsync(
        Guid id,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Gets all distributions for a survey.
    /// </summary>
    Task<IReadOnlyList<EmailDistribution>> GetBySurveyIdAsync(
        Guid surveyId,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Gets paginated distributions for a survey.
    /// </summary>
    Task<(IReadOnlyList<EmailDistribution> Items, int TotalCount)> GetPagedBySurveyIdAsync(
        Guid surveyId,
        int pageNumber,
        int pageSize,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Gets distributions by namespace.
    /// </summary>
    Task<IReadOnlyList<EmailDistribution>> GetByNamespaceIdAsync(
        Guid namespaceId,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Gets scheduled distributions that are due to be sent.
    /// </summary>
    Task<IReadOnlyList<EmailDistribution>> GetScheduledDueAsync(
        DateTime asOfTime,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Gets distributions by status.
    /// </summary>
    Task<IReadOnlyList<EmailDistribution>> GetByStatusAsync(
        Guid namespaceId,
        DistributionStatus status,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Gets a recipient by its unique tracking token.
    /// </summary>
    Task<EmailRecipient?> GetRecipientByTokenAsync(
        string token,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Gets recipients for a distribution.
    /// </summary>
    Task<IReadOnlyList<EmailRecipient>> GetRecipientsByDistributionIdAsync(
        Guid distributionId,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Gets paginated recipients for a distribution.
    /// </summary>
    Task<(IReadOnlyList<EmailRecipient> Items, int TotalCount)> GetRecipientsPagedAsync(
        Guid distributionId,
        int pageNumber,
        int pageSize,
        RecipientStatus? status = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Adds a new distribution.
    /// </summary>
    void Add(EmailDistribution distribution);

    /// <summary>
    /// Updates an existing distribution.
    /// </summary>
    void Update(EmailDistribution distribution);

    /// <summary>
    /// Deletes a distribution (soft delete).
    /// </summary>
    void Delete(EmailDistribution distribution);

    /// <summary>
    /// Updates a recipient.
    /// </summary>
    void UpdateRecipient(EmailRecipient recipient);
}
