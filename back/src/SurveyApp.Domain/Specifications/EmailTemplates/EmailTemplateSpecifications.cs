using Ardalis.Specification;
using SurveyApp.Domain.Entities;
using SurveyApp.Domain.Enums;
using SurveyApp.Domain.Specifications.Base;

namespace SurveyApp.Domain.Specifications.EmailTemplates;

/// <summary>
/// Specification for retrieving an email template by its ID.
/// </summary>
public sealed class EmailTemplateByIdSpec : BaseSpecification<EmailTemplate>
{
    public EmailTemplateByIdSpec(Guid id)
    {
        Query.Where(t => t.Id == id);

        Query.Include(t => t.Translations);

        AsReadOnly();
    }
}

/// <summary>
/// Specification for retrieving an email template by its ID with change tracking.
/// </summary>
public sealed class EmailTemplateByIdForUpdateSpec : BaseSpecification<EmailTemplate>
{
    public EmailTemplateByIdForUpdateSpec(Guid id)
    {
        Query.Where(t => t.Id == id);

        Query.Include(t => t.Translations);

        // Keep tracking enabled
    }
}

/// <summary>
/// Filter criteria for email template queries.
/// </summary>
public record EmailTemplateFilterCriteria
{
    /// <summary>
    /// Gets or sets the namespace ID (required).
    /// </summary>
    public Guid NamespaceId { get; init; }

    /// <summary>
    /// Gets or sets the optional type filter.
    /// </summary>
    public EmailTemplateType? Type { get; init; }

    /// <summary>
    /// Gets or sets the optional search term.
    /// </summary>
    public string? SearchTerm { get; init; }

    /// <summary>
    /// Gets or sets the paging parameters.
    /// </summary>
    public PagingParameters? Paging { get; init; }
}

/// <summary>
/// Specification for querying email templates with filtering.
/// </summary>
public sealed class EmailTemplatesFilteredSpec : NamespaceScopedSpecification<EmailTemplate>
{
    public EmailTemplatesFilteredSpec(EmailTemplateFilterCriteria criteria)
        : base(criteria.NamespaceId)
    {
        Query.Where(t => t.NamespaceId == NamespaceId);

        Query.Include(t => t.Translations);

        if (criteria.Type.HasValue)
        {
            Query.Where(t => t.Type == criteria.Type.Value);
        }

        if (!string.IsNullOrWhiteSpace(criteria.SearchTerm))
        {
            var searchTerm = criteria.SearchTerm.ToLower();
            Query.Where(t =>
                t.Translations.Any(tr =>
                    tr.Name.ToLower().Contains(searchTerm)
                    || tr.Subject.ToLower().Contains(searchTerm)
                )
            );
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
/// Specification for querying email templates by namespace.
/// </summary>
public sealed class EmailTemplatesByNamespaceSpec : NamespaceScopedSpecification<EmailTemplate>
{
    public EmailTemplatesByNamespaceSpec(Guid namespaceId)
        : base(namespaceId)
    {
        Query.Where(t => t.NamespaceId == NamespaceId);

        Query.Include(t => t.Translations);

        Query.OrderByDescending(t => t.CreatedAt);

        AsReadOnly();
    }
}

/// <summary>
/// Specification for querying email templates by type.
/// </summary>
public sealed class EmailTemplatesByTypeSpec : NamespaceScopedSpecification<EmailTemplate>
{
    public EmailTemplatesByTypeSpec(Guid namespaceId, EmailTemplateType type)
        : base(namespaceId)
    {
        Query.Where(t => t.NamespaceId == NamespaceId && t.Type == type);

        Query.Include(t => t.Translations);

        Query.OrderByDescending(t => t.IsDefault).ThenByDescending(t => t.CreatedAt);

        AsReadOnly();
    }
}

/// <summary>
/// Specification for getting the default template by type.
/// </summary>
public sealed class DefaultEmailTemplateByTypeSpec : NamespaceScopedSpecification<EmailTemplate>
{
    public DefaultEmailTemplateByTypeSpec(Guid namespaceId, EmailTemplateType type)
        : base(namespaceId)
    {
        Query.Where(t => t.NamespaceId == NamespaceId && t.Type == type && t.IsDefault);

        Query.Include(t => t.Translations);

        AsReadOnly();
    }
}

/// <summary>
/// Specification for checking if a template name exists in translations.
/// </summary>
public sealed class EmailTemplateNameExistsSpec : BaseSpecification<EmailTemplateTranslation>
{
    public EmailTemplateNameExistsSpec(Guid namespaceId, string name, Guid? excludeId = null)
    {
        Query.Where(t => t.EmailTemplate.NamespaceId == namespaceId && t.Name == name);

        if (excludeId.HasValue)
        {
            Query.Where(t => t.EmailTemplateId != excludeId.Value);
        }

        AsReadOnly();
    }
}
