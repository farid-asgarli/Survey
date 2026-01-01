using Ardalis.Specification;
using SurveyApp.Domain.Entities;
using SurveyApp.Domain.Specifications.Base;

namespace SurveyApp.Domain.Specifications.Templates;

/// <summary>
/// Specification for retrieving a template by its ID.
/// </summary>
public sealed class TemplateByIdSpec : BaseSpecification<SurveyTemplate>
{
    public TemplateByIdSpec(Guid id, bool includeQuestions = false)
    {
        Query.Where(t => t.Id == id);

        Query.Include(t => t.Translations);

        if (includeQuestions)
        {
            Query.Include(t => t.Questions.OrderBy(q => q.Order)).ThenInclude(q => q.Translations);
        }

        AsReadOnly();
    }
}

/// <summary>
/// Specification for retrieving a template by its ID with change tracking for updates.
/// </summary>
public sealed class TemplateByIdForUpdateSpec : BaseSpecification<SurveyTemplate>
{
    public TemplateByIdForUpdateSpec(Guid id, bool includeQuestions = false)
    {
        Query.Where(t => t.Id == id);

        Query.Include(t => t.Translations);

        if (includeQuestions)
        {
            Query.Include(t => t.Questions.OrderBy(q => q.Order)).ThenInclude(q => q.Translations);
        }

        // Keep tracking enabled
    }
}

/// <summary>
/// Filter criteria for template queries.
/// </summary>
public record TemplateFilterCriteria
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
    /// Gets or sets the optional category filter.
    /// </summary>
    public string? Category { get; init; }

    /// <summary>
    /// Gets or sets the optional public filter.
    /// </summary>
    public bool? IsPublic { get; init; }

    /// <summary>
    /// Gets or sets the optional creator ID filter.
    /// </summary>
    public Guid? CreatorId { get; init; }

    /// <summary>
    /// Gets or sets the paging parameters.
    /// </summary>
    public PagingParameters? Paging { get; init; }
}

/// <summary>
/// Specification for querying templates with filtering and paging.
/// </summary>
public sealed class TemplatesFilteredSpec : NamespaceScopedSpecification<SurveyTemplate>
{
    public TemplatesFilteredSpec(TemplateFilterCriteria criteria)
        : base(criteria.NamespaceId)
    {
        Query.Where(t => t.NamespaceId == NamespaceId);

        Query
            .Include(t => t.Translations)
            .Include(t => t.Questions)
            .ThenInclude(q => q.Translations);

        // Apply search term filter
        if (!string.IsNullOrWhiteSpace(criteria.SearchTerm))
        {
            var searchTerm = criteria.SearchTerm.ToLower();
            Query.Where(t =>
                t.Translations.Any(tr =>
                    tr.Name.ToLower().Contains(searchTerm)
                    || (tr.Description != null && tr.Description.ToLower().Contains(searchTerm))
                )
            );
        }

        // Apply category filter
        if (!string.IsNullOrWhiteSpace(criteria.Category))
        {
            Query.Where(t => t.Translations.Any(tr => tr.Category == criteria.Category));
        }

        // Apply public filter
        if (criteria.IsPublic.HasValue)
        {
            Query.Where(t => t.IsPublic == criteria.IsPublic.Value);
        }

        // Apply creator filter
        if (criteria.CreatorId.HasValue)
        {
            Query.Where(t => t.CreatedBy == criteria.CreatorId.Value);
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
/// Specification for querying templates by namespace.
/// </summary>
public sealed class TemplatesByNamespaceSpec : NamespaceScopedSpecification<SurveyTemplate>
{
    public TemplatesByNamespaceSpec(Guid namespaceId)
        : base(namespaceId)
    {
        Query.Where(t => t.NamespaceId == NamespaceId);

        Query
            .Include(t => t.Translations)
            .Include(t => t.Questions)
            .ThenInclude(q => q.Translations);

        Query.OrderByDescending(t => t.CreatedAt);

        AsReadOnly();
    }
}

/// <summary>
/// Specification for querying public templates by namespace.
/// </summary>
public sealed class PublicTemplatesByNamespaceSpec : NamespaceScopedSpecification<SurveyTemplate>
{
    public PublicTemplatesByNamespaceSpec(Guid namespaceId)
        : base(namespaceId)
    {
        Query.Where(t => t.NamespaceId == NamespaceId && t.IsPublic);

        Query
            .Include(t => t.Translations)
            .Include(t => t.Questions)
            .ThenInclude(q => q.Translations);

        Query.OrderByDescending(t => t.UsageCount).ThenByDescending(t => t.CreatedAt);

        AsReadOnly();
    }
}

/// <summary>
/// Specification for querying templates by category.
/// </summary>
public sealed class TemplatesByCategorySpec : NamespaceScopedSpecification<SurveyTemplate>
{
    public TemplatesByCategorySpec(Guid namespaceId, string category)
        : base(namespaceId)
    {
        Query.Where(t =>
            t.NamespaceId == NamespaceId && t.Translations.Any(tr => tr.Category == category)
        );

        Query
            .Include(t => t.Translations)
            .Include(t => t.Questions)
            .ThenInclude(q => q.Translations);

        Query.OrderByDescending(t => t.CreatedAt);

        AsReadOnly();
    }
}

/// <summary>
/// Specification for querying templates by creator.
/// </summary>
public sealed class TemplatesByCreatorSpec : NamespaceScopedSpecification<SurveyTemplate>
{
    public TemplatesByCreatorSpec(Guid namespaceId, Guid creatorId)
        : base(namespaceId)
    {
        Query.Where(t => t.NamespaceId == NamespaceId && t.CreatedBy == creatorId);

        Query
            .Include(t => t.Translations)
            .Include(t => t.Questions)
            .ThenInclude(q => q.Translations);

        Query.OrderByDescending(t => t.CreatedAt);

        AsReadOnly();
    }
}
