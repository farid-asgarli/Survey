using Ardalis.Specification;
using Ardalis.Specification.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using SurveyApp.Domain.Specifications;
using SurveyApp.Infrastructure.Persistence;

namespace SurveyApp.Infrastructure.Repositories;

/// <summary>
/// Generic repository implementation that supports specification pattern queries.
/// Leverages Ardalis.Specification.EntityFrameworkCore for specification evaluation.
/// </summary>
/// <typeparam name="T">The entity type.</typeparam>
public class SpecificationRepository<T>(ApplicationDbContext context) : ISpecificationRepository<T>
    where T : class
{
    private readonly ApplicationDbContext _context = context;
    private readonly ISpecificationEvaluator _specificationEvaluator =
        SpecificationEvaluator.Default;

    /// <inheritdoc />
    public async Task<TResult?> FirstOrDefaultAsync<TResult>(
        ISpecification<T, TResult> specification,
        CancellationToken cancellationToken = default
    )
    {
        return await ApplySpecification(specification).FirstOrDefaultAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<T?> FirstOrDefaultAsync(
        ISpecification<T> specification,
        CancellationToken cancellationToken = default
    )
    {
        return await ApplySpecification(specification).FirstOrDefaultAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<T> SingleAsync(
        ISpecification<T> specification,
        CancellationToken cancellationToken = default
    )
    {
        return await ApplySpecification(specification).SingleAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<T>> ListAsync(
        ISpecification<T> specification,
        CancellationToken cancellationToken = default
    )
    {
        return await ApplySpecification(specification).ToListAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<TResult>> ListAsync<TResult>(
        ISpecification<T, TResult> specification,
        CancellationToken cancellationToken = default
    )
    {
        return await ApplySpecification(specification).ToListAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<int> CountAsync(
        ISpecification<T> specification,
        CancellationToken cancellationToken = default
    )
    {
        return await ApplySpecification(specification, evaluateCriteriaOnly: true)
            .CountAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<bool> AnyAsync(
        ISpecification<T> specification,
        CancellationToken cancellationToken = default
    )
    {
        return await ApplySpecification(specification, evaluateCriteriaOnly: true)
            .AnyAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<(IReadOnlyList<T> Items, int TotalCount)> GetPagedAsync(
        ISpecification<T> specification,
        CancellationToken cancellationToken = default
    )
    {
        // Get total count without paging
        var totalCount = await ApplySpecification(specification, evaluateCriteriaOnly: true)
            .CountAsync(cancellationToken);

        // Get paged items
        var items = await ApplySpecification(specification).ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    /// <inheritdoc />
    public async Task<(IReadOnlyList<TResult> Items, int TotalCount)> GetPagedAsync<TResult>(
        ISpecification<T, TResult> specification,
        CancellationToken cancellationToken = default
    )
    {
        // Get total count without paging - need a separate count query
        var countSpec = new CountSpecificationWrapper<T>(specification);
        var totalCount = await ApplySpecification(countSpec, evaluateCriteriaOnly: true)
            .CountAsync(cancellationToken);

        // Get paged items
        var items = await ApplySpecification(specification).ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    /// <summary>
    /// Applies the specification to the query.
    /// </summary>
    private IQueryable<T> ApplySpecification(
        ISpecification<T> specification,
        bool evaluateCriteriaOnly = false
    )
    {
        return _specificationEvaluator.GetQuery(
            _context.Set<T>().AsQueryable(),
            specification,
            evaluateCriteriaOnly
        );
    }

    /// <summary>
    /// Applies the specification with projection to the query.
    /// </summary>
    private IQueryable<TResult> ApplySpecification<TResult>(
        ISpecification<T, TResult> specification
    )
    {
        return _specificationEvaluator.GetQuery(_context.Set<T>().AsQueryable(), specification);
    }

    /// <summary>
    /// Internal specification wrapper for count queries.
    /// </summary>
    private class CountSpecificationWrapper<TEntity> : Specification<TEntity>
        where TEntity : class
    {
        public CountSpecificationWrapper(ISpecification<TEntity> innerSpec)
        {
            // Copy only the Where criteria from the inner specification
            foreach (var criteria in innerSpec.WhereExpressions)
            {
                Query.Where(criteria.Filter);
            }
        }
    }
}
