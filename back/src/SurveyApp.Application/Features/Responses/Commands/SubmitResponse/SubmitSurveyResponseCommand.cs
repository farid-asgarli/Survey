using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.DTOs;

namespace SurveyApp.Application.Features.Responses.Commands.SubmitResponse;

public record SubmitSurveyResponseCommand : IRequest<Result<SurveyResponseDto>>
{
    public Guid SurveyId { get; init; }
    public List<SubmitAnswerDto> Answers { get; init; } = [];
    public Dictionary<string, string>? Metadata { get; init; }
}

public record SubmitAnswerDto
{
    public Guid QuestionId { get; init; }
    public string? Value { get; init; }
}
