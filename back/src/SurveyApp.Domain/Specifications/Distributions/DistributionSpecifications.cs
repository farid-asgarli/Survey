using Ardalis.Specification;
using SurveyApp.Domain.Entities;
using SurveyApp.Domain.Enums;
using SurveyApp.Domain.Specifications.Base;

namespace SurveyApp.Domain.Specifications.Distributions;

/// <summary>
/// Specification for retrieving a distribution by its ID.
/// </summary>
public sealed class DistributionByIdSpec : BaseSpecification<EmailDistribution>
{
    public DistributionByIdSpec(Guid id, bool includeRecipients = false)
    {
        Query.Where(d => d.Id == id);

        if (includeRecipients)
        {
            Query.Include(d => d.Recipients);
        }

        AsReadOnly();
    }
}

/// <summary>
/// Specification for retrieving a distribution by its ID with change tracking.
/// </summary>
public sealed class DistributionByIdForUpdateSpec : BaseSpecification<EmailDistribution>
{
    public DistributionByIdForUpdateSpec(Guid id, bool includeRecipients = false)
    {
        Query.Where(d => d.Id == id);

        if (includeRecipients)
        {
            Query.Include(d => d.Recipients);
        }

        // Keep tracking enabled
    }
}

/// <summary>
/// Filter criteria for distribution queries.
/// </summary>
public record DistributionFilterCriteria
{
    /// <summary>
    /// Gets or sets the survey ID filter (optional).
    /// </summary>
    public Guid? SurveyId { get; init; }

    /// <summary>
    /// Gets or sets the namespace ID filter (optional).
    /// </summary>
    public Guid? NamespaceId { get; init; }

    /// <summary>
    /// Gets or sets the status filter.
    /// </summary>
    public DistributionStatus? Status { get; init; }

    /// <summary>
    /// Gets or sets the paging parameters.
    /// </summary>
    public PagingParameters? Paging { get; init; }
}

/// <summary>
/// Specification for querying distributions by survey.
/// </summary>
public sealed class DistributionsBySurveySpec : BaseSpecification<EmailDistribution>
{
    public DistributionsBySurveySpec(Guid surveyId, PagingParameters? paging = null)
    {
        Query.Where(d => d.SurveyId == surveyId);

        Query.OrderByDescending(d => d.CreatedAt);

        if (paging != null)
        {
            ApplyPaging(paging);
        }

        AsReadOnly();
    }
}

/// <summary>
/// Specification for querying distributions by namespace.
/// </summary>
public sealed class DistributionsByNamespaceSpec : NamespaceScopedSpecification<EmailDistribution>
{
    public DistributionsByNamespaceSpec(Guid namespaceId)
        : base(namespaceId)
    {
        Query.Where(d => d.NamespaceId == NamespaceId);

        Query.OrderByDescending(d => d.CreatedAt);

        AsReadOnly();
    }
}

/// <summary>
/// Specification for querying distributions that are scheduled and due.
/// </summary>
public sealed class ScheduledDistributionsDueSpec : BaseSpecification<EmailDistribution>
{
    public ScheduledDistributionsDueSpec(DateTime asOfTime)
    {
        Query.Where(d => d.Status == DistributionStatus.Scheduled && d.ScheduledAt <= asOfTime);

        Query.Include(d => d.Recipients);

        // No AsNoTracking - these will be updated
    }
}

/// <summary>
/// Specification for querying distributions by status within a namespace.
/// </summary>
public sealed class DistributionsByStatusSpec : NamespaceScopedSpecification<EmailDistribution>
{
    public DistributionsByStatusSpec(Guid namespaceId, DistributionStatus status)
        : base(namespaceId)
    {
        Query.Where(d => d.NamespaceId == NamespaceId && d.Status == status);

        Query.OrderByDescending(d => d.CreatedAt);

        AsReadOnly();
    }
}

/// <summary>
/// Specification for retrieving a recipient by token.
/// </summary>
public sealed class RecipientByTokenSpec : BaseSpecification<EmailRecipient>
{
    public RecipientByTokenSpec(string token)
    {
        Query.Where(r => r.UniqueToken == token);

        // Keep tracking for updates
    }
}

/// <summary>
/// Specification for querying recipients by distribution.
/// </summary>
public sealed class RecipientsByDistributionSpec : BaseSpecification<EmailRecipient>
{
    public RecipientsByDistributionSpec(
        Guid distributionId,
        RecipientStatus? status = null,
        PagingParameters? paging = null
    )
    {
        Query.Where(r => r.DistributionId == distributionId);

        if (status.HasValue)
        {
            Query.Where(r => r.Status == status.Value);
        }

        Query.OrderBy(r => r.Email);

        if (paging != null)
        {
            ApplyPaging(paging);
        }

        AsReadOnly();
    }
}
