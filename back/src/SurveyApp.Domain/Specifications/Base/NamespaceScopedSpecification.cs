namespace SurveyApp.Domain.Specifications.Base;

/// <summary>
/// Base specification for entities that have a NamespaceId property.
/// Provides common namespace filtering functionality.
/// </summary>
/// <typeparam name="T">The entity type.</typeparam>
public abstract class NamespaceScopedSpecification<T> : BaseSpecification<T>
    where T : class
{
    /// <summary>
    /// Gets the namespace ID used for filtering.
    /// </summary>
    protected Guid NamespaceId { get; }

    /// <summary>
    /// Creates a new namespace-scoped specification.
    /// </summary>
    /// <param name="namespaceId">The namespace ID to filter by.</param>
    protected NamespaceScopedSpecification(Guid namespaceId)
    {
        NamespaceId = namespaceId;
    }
}

/// <summary>
/// Base specification for entities that have a NamespaceId property with projection support.
/// </summary>
/// <typeparam name="T">The entity type.</typeparam>
/// <typeparam name="TResult">The projection result type.</typeparam>
public abstract class NamespaceScopedSpecification<T, TResult> : BaseSpecification<T, TResult>
    where T : class
{
    /// <summary>
    /// Gets the namespace ID used for filtering.
    /// </summary>
    protected Guid NamespaceId { get; }

    /// <summary>
    /// Creates a new namespace-scoped specification.
    /// </summary>
    /// <param name="namespaceId">The namespace ID to filter by.</param>
    protected NamespaceScopedSpecification(Guid namespaceId)
    {
        NamespaceId = namespaceId;
    }
}
