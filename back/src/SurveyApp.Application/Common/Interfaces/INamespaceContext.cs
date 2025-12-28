namespace SurveyApp.Application.Common.Interfaces;

/// <summary>
/// Interface for accessing the current namespace context.
/// </summary>
public interface INamespaceContext
{
    /// <summary>
    /// Gets the current namespace ID.
    /// </summary>
    Guid? NamespaceId { get; }

    /// <summary>
    /// Gets the current namespace ID (alias for NamespaceId).
    /// </summary>
    Guid? CurrentNamespaceId { get; }

    /// <summary>
    /// Gets whether a namespace context is set.
    /// </summary>
    bool HasNamespace { get; }

    /// <summary>
    /// Sets the current namespace ID.
    /// </summary>
    void SetNamespaceId(Guid namespaceId);

    /// <summary>
    /// Clears the current namespace context.
    /// </summary>
    void Clear();
}
