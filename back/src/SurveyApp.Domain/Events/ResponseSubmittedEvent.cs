using SurveyApp.Domain.Common;

namespace SurveyApp.Domain.Events;

/// <summary>
/// Event raised when a survey response is submitted.
/// </summary>
public sealed class ResponseSubmittedEvent(Guid responseId, Guid surveyId, string? respondentEmail)
    : IDomainEvent
{
    /// <summary>
    /// Gets the response ID.
    /// </summary>
    public Guid ResponseId { get; } = responseId;

    /// <summary>
    /// Gets the survey ID.
    /// </summary>
    public Guid SurveyId { get; } = surveyId;

    /// <summary>
    /// Gets the respondent email (if provided).
    /// </summary>
    public string? RespondentEmail { get; } = respondentEmail;

    /// <inheritdoc />
    public DateTime OccurredOn { get; } = DateTime.UtcNow;
}
