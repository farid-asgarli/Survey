using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.DTOs;

namespace SurveyApp.Application.Features.QuestionLogic.Queries.GetSurveyLogicMap;

/// <summary>
/// Query to get the complete logic map for a survey.
/// </summary>
public record GetSurveyLogicMapQuery : IRequest<Result<SurveyLogicMapDto>>
{
    /// <summary>
    /// The survey ID.
    /// </summary>
    public Guid SurveyId { get; init; }
}
