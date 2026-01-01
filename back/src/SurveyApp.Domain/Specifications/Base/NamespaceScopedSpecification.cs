namespace SurveyApp.Domain.Specifications.Base;

/// <summary>
/// Base specification for entities that have a NamespaceId property.
/// Provides common namespace filtering functionality.
/// </summary>
/// <typeparam name="T">The entity type.</typeparam>
/// <remarks>
/// Creates a new namespace-scoped specification.
/// </remarks>
/// <param name="namespaceId">The namespace ID to filter by.</param>
public abstract class NamespaceScopedSpecification<T>(Guid namespaceId) : BaseSpecification<T>
    where T : class
{
    /// <summary>
    /// Gets the namespace ID used for filtering.
    /// </summary>
    protected Guid NamespaceId { get; } = namespaceId;
}

/// <summary>
/// Base specification for entities that have a NamespaceId property with projection support.
/// </summary>
/// <typeparam name="T">The entity type.</typeparam>
/// <typeparam name="TResult">The projection result type.</typeparam>
/// <remarks>
/// Creates a new namespace-scoped specification.
/// </remarks>
/// <param name="namespaceId">The namespace ID to filter by.</param>
public abstract class NamespaceScopedSpecification<T, TResult>(Guid namespaceId)
    : BaseSpecification<T, TResult>
    where T : class
{
    /// <summary>
    /// Gets the namespace ID used for filtering.
    /// </summary>
    protected Guid NamespaceId { get; } = namespaceId;
}
