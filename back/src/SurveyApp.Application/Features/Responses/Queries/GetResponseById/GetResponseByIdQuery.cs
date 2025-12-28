using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.DTOs;

namespace SurveyApp.Application.Features.Responses.Queries.GetResponseById;

public record GetResponseByIdQuery : IRequest<Result<SurveyResponseDto>>
{
    public Guid ResponseId { get; init; }
}
