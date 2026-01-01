using Ardalis.Specification;
using SurveyApp.Domain.Entities;
using SurveyApp.Domain.Specifications.Base;

namespace SurveyApp.Domain.Specifications.Namespaces;

/// <summary>
/// Specification for retrieving a namespace by its ID.
/// </summary>
public sealed class NamespaceByIdSpec : BaseSpecification<Namespace>
{
    public NamespaceByIdSpec(Guid id, bool includeMemberships = true)
    {
        Query.Where(n => n.Id == id);

        if (includeMemberships)
        {
            Query.Include(n => n.Memberships).ThenInclude(m => m.User);
        }

        AsReadOnly();
    }
}

/// <summary>
/// Specification for retrieving a namespace by its ID with change tracking.
/// </summary>
public sealed class NamespaceByIdForUpdateSpec : BaseSpecification<Namespace>
{
    public NamespaceByIdForUpdateSpec(Guid id, bool includeMemberships = true)
    {
        Query.Where(n => n.Id == id);

        if (includeMemberships)
        {
            Query.Include(n => n.Memberships).ThenInclude(m => m.User);
        }

        // Keep tracking enabled
    }
}

/// <summary>
/// Specification for retrieving a namespace by its slug.
/// </summary>
public sealed class NamespaceBySlugSpec : BaseSpecification<Namespace>
{
    public NamespaceBySlugSpec(string slug, bool includeMemberships = true)
    {
        Query.Where(n => n.Slug == slug);

        if (includeMemberships)
        {
            Query.Include(n => n.Memberships).ThenInclude(m => m.User);
        }

        AsReadOnly();
    }
}

/// <summary>
/// Specification for checking if a slug exists.
/// </summary>
public sealed class SlugExistsSpec : BaseSpecification<Namespace>
{
    public SlugExistsSpec(string slug)
    {
        Query.Where(n => n.Slug == slug);
    }
}

/// <summary>
/// Specification for querying all namespaces.
/// </summary>
public sealed class AllNamespacesSpec : BaseSpecification<Namespace>
{
    public AllNamespacesSpec()
    {
        Query.Include(n => n.Memberships);

        AsReadOnly();
    }
}

/// <summary>
/// Specification for querying namespaces by user membership.
/// </summary>
public sealed class NamespacesByUserSpec : BaseSpecification<Namespace>
{
    public NamespacesByUserSpec(Guid userId)
    {
        Query.Where(n => n.Memberships.Any(m => m.UserId == userId));

        Query.Include(n => n.Memberships);

        AsReadOnly();
    }
}
