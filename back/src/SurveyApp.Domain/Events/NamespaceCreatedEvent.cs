using SurveyApp.Domain.Common;

namespace SurveyApp.Domain.Events;

/// <summary>
/// Event raised when a namespace is created.
/// </summary>
public sealed class NamespaceCreatedEvent(Guid namespaceId, string name, string slug) : IDomainEvent
{
    /// <summary>
    /// Gets the namespace ID.
    /// </summary>
    public Guid NamespaceId { get; } = namespaceId;

    /// <summary>
    /// Gets the namespace name.
    /// </summary>
    public string Name { get; } = name;

    /// <summary>
    /// Gets the namespace slug.
    /// </summary>
    public string Slug { get; } = slug;

    /// <inheritdoc />
    public DateTime OccurredOn { get; } = DateTime.UtcNow;
}
