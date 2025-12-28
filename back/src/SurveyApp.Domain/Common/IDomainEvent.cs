namespace SurveyApp.Domain.Common;

/// <summary>
/// Base interface for domain events.
/// </summary>
public interface IDomainEvent
{
    /// <summary>
    /// The date and time when the event occurred.
    /// </summary>
    DateTime OccurredOn { get; }
}
