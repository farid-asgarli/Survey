using Ardalis.Specification;
using SurveyApp.Domain.Entities;
using SurveyApp.Domain.Specifications.Base;

namespace SurveyApp.Domain.Specifications.Themes;

/// <summary>
/// Specification for retrieving a theme by its ID.
/// </summary>
public sealed class ThemeByIdSpec : BaseSpecification<SurveyTheme>
{
    public ThemeByIdSpec(Guid id)
    {
        Query.Where(t => t.Id == id);

        Query.Include(t => t.Translations);

        AsReadOnly();
    }
}

/// <summary>
/// Specification for retrieving a theme by its ID with change tracking.
/// </summary>
public sealed class ThemeByIdForUpdateSpec : BaseSpecification<SurveyTheme>
{
    public ThemeByIdForUpdateSpec(Guid id)
    {
        Query.Where(t => t.Id == id);

        Query.Include(t => t.Translations);

        // Keep tracking enabled
    }
}

/// <summary>
/// Filter criteria for theme queries.
/// </summary>
public record ThemeFilterCriteria
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
    /// Gets or sets the optional public filter.
    /// </summary>
    public bool? IsPublic { get; init; }

    /// <summary>
    /// Gets or sets the paging parameters.
    /// </summary>
    public PagingParameters? Paging { get; init; }
}

/// <summary>
/// Specification for querying themes with filtering.
/// </summary>
public sealed class ThemesFilteredSpec : NamespaceScopedSpecification<SurveyTheme>
{
    public ThemesFilteredSpec(ThemeFilterCriteria criteria)
        : base(criteria.NamespaceId)
    {
        Query.Where(t => t.NamespaceId == NamespaceId);

        Query.Include(t => t.Translations);

        if (criteria.IsPublic.HasValue)
        {
            Query.Where(t => t.IsPublic == criteria.IsPublic.Value);
        }

        if (!string.IsNullOrWhiteSpace(criteria.SearchTerm))
        {
            var searchTerm = criteria.SearchTerm.ToLower();
            Query.Where(t => t.Translations.Any(tr => tr.Name.ToLower().Contains(searchTerm)));
        }

        Query.OrderByDescending(t => t.CreatedAt);

        if (criteria.Paging != null)
        {
            ApplyPaging(criteria.Paging);
        }

        AsReadOnly();
    }
}

/// <summary>
/// Specification for querying themes by namespace.
/// </summary>
public sealed class ThemesByNamespaceSpec : NamespaceScopedSpecification<SurveyTheme>
{
    public ThemesByNamespaceSpec(Guid namespaceId)
        : base(namespaceId)
    {
        Query.Where(t => t.NamespaceId == NamespaceId);

        Query.Include(t => t.Translations);

        Query.OrderByDescending(t => t.CreatedAt);

        AsReadOnly();
    }
}

/// <summary>
/// Specification for querying public themes by namespace.
/// </summary>
public sealed class PublicThemesByNamespaceSpec : NamespaceScopedSpecification<SurveyTheme>
{
    public PublicThemesByNamespaceSpec(Guid namespaceId)
        : base(namespaceId)
    {
        Query.Where(t => t.NamespaceId == NamespaceId && t.IsPublic);

        Query.Include(t => t.Translations);

        Query.OrderByDescending(t => t.CreatedAt);

        AsReadOnly();
    }
}
