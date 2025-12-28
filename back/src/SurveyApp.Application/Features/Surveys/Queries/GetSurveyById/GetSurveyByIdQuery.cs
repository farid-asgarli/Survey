using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.DTOs;

namespace SurveyApp.Application.Features.Surveys.Queries.GetSurveyById;

public record GetSurveyByIdQuery : IRequest<Result<SurveyDetailsDto>>
{
    public Guid SurveyId { get; init; }
}
