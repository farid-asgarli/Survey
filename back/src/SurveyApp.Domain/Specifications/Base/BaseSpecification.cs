using Ardalis.Specification;

namespace SurveyApp.Domain.Specifications.Base;

/// <summary>
/// Base specification class that provides common functionality for all specifications.
/// Extends Ardalis.Specification with domain-specific features.
/// </summary>
/// <typeparam name="T">The entity type.</typeparam>
public abstract class BaseSpecification<T> : Specification<T>
    where T : class
{
    /// <summary>
    /// Applies paging to the specification.
    /// </summary>
    /// <param name="paging">The paging parameters.</param>
    protected void ApplyPaging(PagingParameters paging)
    {
        Query.Skip(paging.Skip).Take(paging.PageSize);
    }

    /// <summary>
    /// Applies paging to the specification with specific values.
    /// </summary>
    /// <param name="pageNumber">The page number (1-based).</param>
    /// <param name="pageSize">The number of items per page.</param>
    protected void ApplyPaging(int pageNumber, int pageSize)
    {
        ApplyPaging(PagingParameters.Create(pageNumber, pageSize));
    }

    /// <summary>
    /// Configures the specification for read-only queries (no tracking).
    /// </summary>
    protected void AsReadOnly()
    {
        Query.AsNoTracking();
    }

    /// <summary>
    /// Configures the specification for queries that will modify entities (with tracking).
    /// </summary>
    protected void ForUpdate()
    {
        Query.AsTracking();
    }
}

/// <summary>
/// Base specification class with projection support.
/// </summary>
/// <typeparam name="T">The entity type.</typeparam>
/// <typeparam name="TResult">The projection result type.</typeparam>
public abstract class BaseSpecification<T, TResult> : Specification<T, TResult>
    where T : class
{
    /// <summary>
    /// Applies paging to the specification.
    /// </summary>
    /// <param name="paging">The paging parameters.</param>
    protected void ApplyPaging(PagingParameters paging)
    {
        Query.Skip(paging.Skip).Take(paging.PageSize);
    }

    /// <summary>
    /// Applies paging to the specification with specific values.
    /// </summary>
    /// <param name="pageNumber">The page number (1-based).</param>
    /// <param name="pageSize">The number of items per page.</param>
    protected void ApplyPaging(int pageNumber, int pageSize)
    {
        ApplyPaging(PagingParameters.Create(pageNumber, pageSize));
    }

    /// <summary>
    /// Configures the specification for read-only queries (no tracking).
    /// </summary>
    protected void AsReadOnly()
    {
        Query.AsNoTracking();
    }
}
