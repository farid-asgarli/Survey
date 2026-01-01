using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.DTOs;

namespace SurveyApp.Application.Features.QuestionLogic.Queries.GetSurveyLogicMap;

/// <summary>
/// Query to get the complete logic map for a survey.
/// </summary>
/// <param name="SurveyId">The survey ID.</param>
public record GetSurveyLogicMapQuery(Guid SurveyId) : IRequest<Result<SurveyLogicMapDto>>;
