using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.DTOs;

namespace SurveyApp.Application.Features.Surveys.Queries.GetSurveyById;

public record GetSurveyByIdQuery(Guid SurveyId) : IRequest<Result<SurveyDetailsDto>>;
