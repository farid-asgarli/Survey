using SurveyApp.Domain.Common;

namespace SurveyApp.Domain.Events;

/// <summary>
/// Event raised when a survey is published.
/// </summary>
public sealed class SurveyPublishedEvent(Guid surveyId, Guid namespaceId, string title)
    : IDomainEvent
{
    /// <summary>
    /// Gets the survey ID.
    /// </summary>
    public Guid SurveyId { get; } = surveyId;

    /// <summary>
    /// Gets the namespace ID.
    /// </summary>
    public Guid NamespaceId { get; } = namespaceId;

    /// <summary>
    /// Gets the survey title.
    /// </summary>
    public string Title { get; } = title;

    /// <inheritdoc />
    public DateTime OccurredOn { get; } = DateTime.UtcNow;
}
