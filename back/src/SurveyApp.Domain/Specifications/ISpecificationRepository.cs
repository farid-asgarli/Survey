using Ardalis.Specification;

namespace SurveyApp.Domain.Specifications;

/// <summary>
/// Generic repository interface that supports specification pattern queries.
/// This interface provides a unified way to query entities using specifications,
/// enabling complex query logic to be encapsulated in reusable specification classes.
/// </summary>
/// <typeparam name="T">The entity type.</typeparam>
public interface ISpecificationRepository<T>
    where T : class
{
    /// <summary>
    /// Gets a single entity matching the specification, or null if not found.
    /// </summary>
    /// <typeparam name="TResult">The result type (can be the entity or a projection).</typeparam>
    /// <param name="specification">The specification defining the query.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The matching entity or null.</returns>
    Task<TResult?> FirstOrDefaultAsync<TResult>(
        ISpecification<T, TResult> specification,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Gets a single entity matching the specification, or null if not found.
    /// </summary>
    /// <param name="specification">The specification defining the query.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The matching entity or null.</returns>
    Task<T?> FirstOrDefaultAsync(
        ISpecification<T> specification,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Gets a single entity matching the specification.
    /// Throws if no entity matches or if multiple entities match.
    /// </summary>
    /// <param name="specification">The specification defining the query.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The matching entity.</returns>
    Task<T> SingleAsync(
        ISpecification<T> specification,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Gets all entities matching the specification.
    /// </summary>
    /// <param name="specification">The specification defining the query.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A list of matching entities.</returns>
    Task<IReadOnlyList<T>> ListAsync(
        ISpecification<T> specification,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Gets all entities matching the specification with projection.
    /// </summary>
    /// <typeparam name="TResult">The projection result type.</typeparam>
    /// <param name="specification">The specification defining the query.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A list of projected results.</returns>
    Task<IReadOnlyList<TResult>> ListAsync<TResult>(
        ISpecification<T, TResult> specification,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Gets the count of entities matching the specification.
    /// </summary>
    /// <param name="specification">The specification defining the query.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The count of matching entities.</returns>
    Task<int> CountAsync(
        ISpecification<T> specification,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Checks if any entity matches the specification.
    /// </summary>
    /// <param name="specification">The specification defining the query.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>True if any entity matches; otherwise, false.</returns>
    Task<bool> AnyAsync(
        ISpecification<T> specification,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Gets paginated results matching the specification.
    /// The specification must have Take and Skip configured for pagination.
    /// </summary>
    /// <param name="specification">The specification defining the query with pagination.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Paginated items and total count.</returns>
    Task<(IReadOnlyList<T> Items, int TotalCount)> GetPagedAsync(
        ISpecification<T> specification,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Gets paginated results matching the specification with projection.
    /// The specification must have Take and Skip configured for pagination.
    /// </summary>
    /// <typeparam name="TResult">The projection result type.</typeparam>
    /// <param name="specification">The specification defining the query with pagination.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Paginated projected items and total count.</returns>
    Task<(IReadOnlyList<TResult> Items, int TotalCount)> GetPagedAsync<TResult>(
        ISpecification<T, TResult> specification,
        CancellationToken cancellationToken = default
    );
}
