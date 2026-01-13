using SurveyApp.Domain.Entities;

namespace SurveyApp.Domain.Interfaces;

/// <summary>
/// Repository interface for SurveyCategory entities.
/// </summary>
public interface ISurveyCategoryRepository
{
    /// <summary>
    /// Gets a category by its ID (read-only, no change tracking).
    /// </summary>
    Task<SurveyCategory?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a category by its ID with change tracking enabled for updates.
    /// </summary>
    Task<SurveyCategory?> GetByIdForUpdateAsync(
        Guid id,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Gets all categories in a namespace.
    /// </summary>
    Task<IReadOnlyList<SurveyCategory>> GetByNamespaceIdAsync(
        Guid namespaceId,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Gets all categories in a namespace with change tracking enabled for updates.
    /// </summary>
    Task<IReadOnlyList<SurveyCategory>> GetByNamespaceIdForUpdateAsync(
        Guid namespaceId,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Gets the survey count for a specific category.
    /// </summary>
    Task<int> GetSurveyCountAsync(Guid categoryId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the default category for a namespace (read-only, no change tracking).
    /// </summary>
    Task<SurveyCategory?> GetDefaultByNamespaceIdAsync(
        Guid namespaceId,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Gets the default category for a namespace with change tracking enabled for updates.
    /// </summary>
    Task<SurveyCategory?> GetDefaultByNamespaceIdForUpdateAsync(
        Guid namespaceId,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Checks if a category with the given name exists in the namespace.
    /// </summary>
    Task<bool> ExistsByNameAsync(
        Guid namespaceId,
        string name,
        Guid? excludeId = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Gets paginated categories for a namespace.
    /// </summary>
    Task<(IReadOnlyList<SurveyCategory> Items, int TotalCount)> GetPagedAsync(
        Guid namespaceId,
        int pageNumber,
        int pageSize,
        string? searchTerm = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Gets categories with their survey counts.
    /// </summary>
    Task<IReadOnlyList<(SurveyCategory Category, int SurveyCount)>> GetWithSurveyCountsAsync(
        Guid namespaceId,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Gets the maximum display order in a namespace.
    /// </summary>
    Task<int> GetMaxDisplayOrderAsync(
        Guid namespaceId,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Checks if a category exists.
    /// </summary>
    Task<bool> ExistsAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Adds a new category.
    /// </summary>
    void Add(SurveyCategory category);

    /// <summary>
    /// Removes a category.
    /// </summary>
    void Remove(SurveyCategory category);
}
