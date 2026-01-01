using MediatR;
using SurveyApp.Application.Common;

namespace SurveyApp.Application.Features.Responses.Commands.StartResponse;

/// <summary>
/// Command to start a new survey response (creates a draft response).
/// This should be called when a respondent begins taking a survey.
/// </summary>
public record StartResponseCommand : IRequest<Result<StartResponseResult>>
{
    /// <summary>
    /// The survey ID to start a response for.
    /// </summary>
    public Guid SurveyId { get; init; }

    /// <summary>
    /// Optional: The survey link token if accessed via a tracked link.
    /// </summary>
    public string? LinkToken { get; init; }

    /// <summary>
    /// Optional: Respondent's email address.
    /// </summary>
    public string? RespondentEmail { get; init; }

    /// <summary>
    /// Optional: Respondent's name.
    /// </summary>
    public string? RespondentName { get; init; }

    /// <summary>
    /// Optional: IP address of the respondent (for analytics).
    /// </summary>
    public string? IpAddress { get; init; }

    /// <summary>
    /// Optional: User agent string of the respondent (for analytics).
    /// </summary>
    public string? UserAgent { get; init; }

    /// <summary>
    /// Optional: Referrer URL (for analytics).
    /// </summary>
    public string? Referrer { get; init; }
}

/// <summary>
/// Result of starting a survey response.
/// </summary>
public record StartResponseResult
{
    /// <summary>
    /// The ID of the newly created response.
    /// </summary>
    public Guid ResponseId { get; init; }

    /// <summary>
    /// The survey ID.
    /// </summary>
    public Guid SurveyId { get; init; }

    /// <summary>
    /// When the response was started.
    /// </summary>
    public DateTime StartedAt { get; init; }
}
