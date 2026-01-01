using Ardalis.Specification;
using SurveyApp.Domain.Entities;
using SurveyApp.Domain.Specifications.Base;

namespace SurveyApp.Domain.Specifications.RecurringSurveys;

/// <summary>
/// Specification for retrieving a recurring survey by its ID.
/// </summary>
public sealed class RecurringSurveyByIdSpec : BaseSpecification<RecurringSurvey>
{
    public RecurringSurveyByIdSpec(Guid id, bool includeRuns = false)
    {
        Query.Where(r => r.Id == id);

        Query.Include(r => r.Survey).ThenInclude(s => s.Translations).Include(r => r.Namespace);

        if (includeRuns)
        {
            Query.Include(r => r.Runs.OrderByDescending(run => run.ScheduledAt));
        }

        AsReadOnly();
    }
}

/// <summary>
/// Specification for retrieving a recurring survey by its ID with change tracking.
/// </summary>
public sealed class RecurringSurveyByIdForUpdateSpec : BaseSpecification<RecurringSurvey>
{
    public RecurringSurveyByIdForUpdateSpec(Guid id)
    {
        Query.Where(r => r.Id == id);

        Query.Include(r => r.Survey).ThenInclude(s => s.Translations).Include(r => r.Namespace);

        // Keep tracking enabled
    }
}

/// <summary>
/// Filter criteria for recurring survey queries.
/// </summary>
public record RecurringSurveyFilterCriteria
{
    /// <summary>
    /// Gets or sets the namespace ID (required).
    /// </summary>
    public Guid NamespaceId { get; init; }

    /// <summary>
    /// Gets or sets the optional search term.
    /// </summary>
    public string? SearchTerm { get; init; }

    /// <summary>
    /// Gets or sets the optional active filter.
    /// </summary>
    public bool? IsActive { get; init; }

    /// <summary>
    /// Gets or sets the paging parameters.
    /// </summary>
    public PagingParameters? Paging { get; init; }
}

/// <summary>
/// Specification for querying recurring surveys with filtering and paging.
/// </summary>
public sealed class RecurringSurveysFilteredSpec : NamespaceScopedSpecification<RecurringSurvey>
{
    public RecurringSurveysFilteredSpec(RecurringSurveyFilterCriteria criteria)
        : base(criteria.NamespaceId)
    {
        Query.Where(r => r.NamespaceId == NamespaceId);

        Query.Include(r => r.Survey).ThenInclude(s => s.Translations);

        if (criteria.IsActive.HasValue)
        {
            Query.Where(r => r.IsActive == criteria.IsActive.Value);
        }

        if (!string.IsNullOrWhiteSpace(criteria.SearchTerm))
        {
            var searchTerm = criteria.SearchTerm.ToLower();
            Query.Where(r =>
                r.Name.ToLower().Contains(searchTerm)
                || r.Survey.Translations.Any(t => t.Title.ToLower().Contains(searchTerm))
            );
        }

        Query.OrderByDescending(r => r.CreatedAt);

        if (criteria.Paging != null)
        {
            ApplyPaging(criteria.Paging);
        }

        AsReadOnly();
    }
}

/// <summary>
/// Specification for querying recurring surveys by namespace.
/// </summary>
public sealed class RecurringSurveysByNamespaceSpec : NamespaceScopedSpecification<RecurringSurvey>
{
    public RecurringSurveysByNamespaceSpec(Guid namespaceId)
        : base(namespaceId)
    {
        Query.Where(r => r.NamespaceId == NamespaceId);

        Query.Include(r => r.Survey).ThenInclude(s => s.Translations);

        Query.OrderByDescending(r => r.CreatedAt);

        AsReadOnly();
    }
}

/// <summary>
/// Specification for querying recurring surveys by survey ID.
/// </summary>
public sealed class RecurringSurveysBySurveySpec : BaseSpecification<RecurringSurvey>
{
    public RecurringSurveysBySurveySpec(Guid surveyId)
    {
        Query.Where(r => r.SurveyId == surveyId);

        Query.OrderByDescending(r => r.CreatedAt);

        AsReadOnly();
    }
}

/// <summary>
/// Specification for querying recurring surveys that are due for execution.
/// </summary>
public sealed class RecurringSurveysDueSpec : BaseSpecification<RecurringSurvey>
{
    public RecurringSurveysDueSpec(DateTime asOfTime)
    {
        Query.Where(r => r.IsActive && r.NextRunAt.HasValue && r.NextRunAt.Value <= asOfTime);

        Query.Include(r => r.Survey).ThenInclude(s => s.Translations);

        // Keep tracking for updates
    }
}

/// <summary>
/// Specification for querying upcoming recurring survey runs.
/// </summary>
public sealed class UpcomingRecurringSurveysSpec : NamespaceScopedSpecification<RecurringSurvey>
{
    public UpcomingRecurringSurveysSpec(Guid namespaceId, int count)
        : base(namespaceId)
    {
        Query.Where(r => r.NamespaceId == NamespaceId && r.IsActive && r.NextRunAt.HasValue);

        Query.Include(r => r.Survey).ThenInclude(s => s.Translations);

        Query.OrderBy(r => r.NextRunAt);

        Query.Take(count);

        AsReadOnly();
    }
}

/// <summary>
/// Specification for querying recurring survey runs with paging.
/// </summary>
public sealed class RecurringSurveyRunsPagedSpec : BaseSpecification<RecurringSurveyRun>
{
    public RecurringSurveyRunsPagedSpec(Guid recurringSurveyId, PagingParameters? paging = null)
    {
        Query.Where(r => r.RecurringSurveyId == recurringSurveyId);

        Query.OrderByDescending(r => r.ScheduledAt);

        if (paging != null)
        {
            ApplyPaging(paging);
        }

        AsReadOnly();
    }
}

/// <summary>
/// Specification for getting a recurring survey run by ID.
/// </summary>
public sealed class RecurringSurveyRunByIdSpec : BaseSpecification<RecurringSurveyRun>
{
    public RecurringSurveyRunByIdSpec(Guid runId, bool forUpdate = false)
    {
        Query.Where(r => r.Id == runId);

        if (!forUpdate)
        {
            AsReadOnly();
        }
    }
}
