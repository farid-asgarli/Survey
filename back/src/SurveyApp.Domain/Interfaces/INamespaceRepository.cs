using SurveyApp.Domain.Entities;

namespace SurveyApp.Domain.Interfaces;

/// <summary>
/// Repository interface for Namespace entities.
/// </summary>
public interface INamespaceRepository
{
    /// <summary>
    /// Gets a namespace by its ID (read-only, no change tracking).
    /// </summary>
    Task<Namespace?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a namespace by its ID with change tracking enabled for updates.
    /// </summary>
    Task<Namespace?> GetByIdForUpdateAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a namespace by its slug.
    /// </summary>
    Task<Namespace?> GetBySlugAsync(string slug, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a namespace with its members.
    /// </summary>
    Task<Namespace?> GetWithMembersAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets paginated members for a namespace.
    /// </summary>
    Task<(IReadOnlyList<NamespaceMembership> Items, int TotalCount)> GetMembersPagedAsync(
        Guid namespaceId,
        int pageNumber,
        int pageSize,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Gets all namespaces.
    /// </summary>
    Task<IReadOnlyList<Namespace>> GetAllAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets namespaces for a specific user.
    /// </summary>
    Task<IReadOnlyList<Namespace>> GetByUserIdAsync(
        Guid userId,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Checks if a slug already exists.
    /// </summary>
    Task<bool> SlugExistsAsync(string slug, CancellationToken cancellationToken = default);

    /// <summary>
    /// Adds a new namespace.
    /// </summary>
    Task<Namespace> AddAsync(Namespace ns, CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates an existing namespace.
    /// </summary>
    void Update(Namespace ns);

    /// <summary>
    /// Deletes a namespace.
    /// </summary>
    void Delete(Namespace ns);
}
