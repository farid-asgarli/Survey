using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.DTOs;

namespace SurveyApp.Application.Features.Responses.Commands.SubmitResponse;

/// <summary>
/// Command to submit/complete a survey response.
/// Can either complete an existing draft response (ResponseId provided)
/// or create and complete a response in one step (legacy flow, SurveyId provided).
/// </summary>
public record SubmitSurveyResponseCommand : IRequest<Result<SurveyResponseDto>>
{
    /// <summary>
    /// The response ID to complete (new flow - preferred).
    /// If provided, this response will be completed with the given answers.
    /// </summary>
    public Guid? ResponseId { get; init; }

    /// <summary>
    /// The survey ID (legacy flow - for backward compatibility).
    /// If ResponseId is not provided, a new response will be created and completed.
    /// </summary>
    public Guid? SurveyId { get; init; }

    /// <summary>
    /// Optional: Link token for tracking (only used in legacy flow).
    /// </summary>
    public string? LinkToken { get; init; }

    /// <summary>
    /// The answers to submit.
    /// </summary>
    public List<SubmitAnswerDto> Answers { get; init; } = [];

    /// <summary>
    /// Optional metadata (IP address, user agent, etc.).
    /// </summary>
    public Dictionary<string, string>? Metadata { get; init; }
}

/// <summary>
/// Answer submission DTO.
/// </summary>
public record SubmitAnswerDto
{
    public Guid QuestionId { get; init; }

    /// <summary>
    /// Selected option IDs for choice questions.
    /// </summary>
    public List<Guid>? SelectedOptionIds { get; init; }

    /// <summary>
    /// Text value for text questions or "Other" input.
    /// </summary>
    public string? Text { get; init; }
}
