using Ardalis.Specification;
using SurveyApp.Domain.Entities;
using SurveyApp.Domain.Enums;
using SurveyApp.Domain.Specifications.Base;

namespace SurveyApp.Domain.Specifications.Surveys;

/// <summary>
/// Filter criteria for survey queries.
/// </summary>
public record SurveyFilterCriteria
{
    /// <summary>
    /// Gets or sets the namespace ID (required).
    /// </summary>
    public Guid NamespaceId { get; init; }

    /// <summary>
    /// Gets or sets the optional status filter.
    /// </summary>
    public SurveyStatus? Status { get; init; }

    /// <summary>
    /// Gets or sets the optional search term for title/description.
    /// </summary>
    public string? SearchTerm { get; init; }

    /// <summary>
    /// Gets or sets the optional creator ID filter.
    /// </summary>
    public Guid? CreatorId { get; init; }

    /// <summary>
    /// Filter surveys created on or after this date (inclusive).
    /// </summary>
    public DateTime? FromDate { get; init; }

    /// <summary>
    /// Filter surveys created on or before this date (inclusive).
    /// </summary>
    public DateTime? ToDate { get; init; }

    /// <summary>
    /// Gets or sets the optional category ID filter.
    /// </summary>
    public Guid? CategoryId { get; init; }

    /// <summary>
    /// Gets or sets the sorting parameters.
    /// </summary>
    public SortingParameters Sorting { get; init; } = SortingParameters.Default;

    /// <summary>
    /// Gets or sets the paging parameters.
    /// </summary>
    public PagingParameters? Paging { get; init; }

    /// <summary>
    /// Gets whether to include response counts (for sorting/filtering).
    /// </summary>
    public bool IncludeResponses { get; init; } = true;
}

/// <summary>
/// Specification for querying surveys with comprehensive filtering, sorting, and paging.
/// </summary>
public sealed class SurveysFilteredSpec : NamespaceScopedSpecification<Survey>
{
    public SurveysFilteredSpec(SurveyFilterCriteria criteria)
        : base(criteria.NamespaceId)
    {
        // Base namespace filter
        Query.Where(s => s.NamespaceId == NamespaceId);

        // Include related data
        Query
            .Include(s => s.Translations)
            .Include(s => s.Questions)
            .ThenInclude(q => q.Translations)
            .Include(s => s.Category!)
            .ThenInclude(c => c.Translations);

        if (criteria.IncludeResponses)
        {
            Query.Include(s => s.Responses);
        }

        // Apply status filter
        if (criteria.Status.HasValue)
        {
            Query.Where(s => s.Status == criteria.Status.Value);
        }

        // Apply creator filter
        if (criteria.CreatorId.HasValue)
        {
            Query.Where(s => s.CreatedBy == criteria.CreatorId.Value);
        }

        // Apply search term filter - search across translations
        if (!string.IsNullOrWhiteSpace(criteria.SearchTerm))
        {
            var searchTerm = criteria.SearchTerm.ToLower();
            Query.Where(s =>
                s.Translations.Any(t =>
                    t.Title.ToLower().Contains(searchTerm)
                    || (t.Description != null && t.Description.ToLower().Contains(searchTerm))
                )
            );
        }

        // Apply date range filter on CreatedAt
        if (criteria.FromDate.HasValue)
        {
            Query.Where(s => s.CreatedAt >= criteria.FromDate.Value);
        }

        if (criteria.ToDate.HasValue)
        {
            // Include the entire day for ToDate
            var endOfDay = criteria.ToDate.Value.Date.AddDays(1).AddTicks(-1);
            Query.Where(s => s.CreatedAt <= endOfDay);
        }

        // Apply category filter
        if (criteria.CategoryId.HasValue)
        {
            Query.Where(s => s.CategoryId == criteria.CategoryId.Value);
        }

        // Apply sorting
        ApplySorting(criteria.Sorting);

        // Apply paging
        if (criteria.Paging != null)
        {
            ApplyPaging(criteria.Paging);
        }

        AsReadOnly();
    }

    private void ApplySorting(SortingParameters sorting)
    {
        switch (sorting.NormalizedSortBy)
        {
            case "title":
                if (sorting.SortDescending)
                    Query.OrderByDescending(s =>
                        s.Translations.OrderBy(t => t.LanguageCode)
                            .Select(t => t.Title)
                            .FirstOrDefault()
                    );
                else
                    Query.OrderBy(s =>
                        s.Translations.OrderBy(t => t.LanguageCode)
                            .Select(t => t.Title)
                            .FirstOrDefault()
                    );
                break;

            case "updatedat":
                if (sorting.SortDescending)
                    Query.OrderByDescending(s => s.UpdatedAt ?? s.CreatedAt);
                else
                    Query.OrderBy(s => s.UpdatedAt ?? s.CreatedAt);
                break;

            case "status":
                if (sorting.SortDescending)
                    Query.OrderByDescending(s => s.Status);
                else
                    Query.OrderBy(s => s.Status);
                break;

            case "responsecount":
                if (sorting.SortDescending)
                    Query.OrderByDescending(s => s.Responses.Count);
                else
                    Query.OrderBy(s => s.Responses.Count);
                break;

            case "questioncount":
                if (sorting.SortDescending)
                    Query.OrderByDescending(s => s.Questions.Count);
                else
                    Query.OrderBy(s => s.Questions.Count);
                break;

            default: // Default: createdAt
                if (sorting.SortDescending)
                    Query.OrderByDescending(s => s.CreatedAt);
                else
                    Query.OrderBy(s => s.CreatedAt);
                break;
        }
    }
}

/// <summary>
/// Specification for querying surveys by namespace (simple list).
/// </summary>
public sealed class SurveysByNamespaceSpec : NamespaceScopedSpecification<Survey>
{
    public SurveysByNamespaceSpec(Guid namespaceId)
        : base(namespaceId)
    {
        Query.Where(s => s.NamespaceId == NamespaceId);

        Query
            .Include(s => s.Translations)
            .Include(s => s.Questions)
            .ThenInclude(q => q.Translations)
            .Include(s => s.Responses);

        Query.OrderByDescending(s => s.CreatedAt);

        AsReadOnly();
    }
}

/// <summary>
/// Specification for querying surveys by status within a namespace.
/// </summary>
public sealed class SurveysByStatusSpec : NamespaceScopedSpecification<Survey>
{
    public SurveysByStatusSpec(Guid namespaceId, SurveyStatus status)
        : base(namespaceId)
    {
        Query.Where(s => s.NamespaceId == NamespaceId && s.Status == status);

        Query
            .Include(s => s.Translations)
            .Include(s => s.Questions)
            .ThenInclude(q => q.Translations);

        Query.OrderByDescending(s => s.CreatedAt);

        AsReadOnly();
    }
}

/// <summary>
/// Specification for querying surveys by creator within a namespace.
/// </summary>
public sealed class SurveysByCreatorSpec : NamespaceScopedSpecification<Survey>
{
    public SurveysByCreatorSpec(Guid namespaceId, Guid creatorId)
        : base(namespaceId)
    {
        Query.Where(s => s.NamespaceId == NamespaceId && s.CreatedBy == creatorId);

        Query
            .Include(s => s.Translations)
            .Include(s => s.Questions)
            .ThenInclude(q => q.Translations);

        Query.OrderByDescending(s => s.CreatedAt);

        AsReadOnly();
    }
}
