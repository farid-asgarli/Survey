using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.DTOs;

namespace SurveyApp.Application.Features.QuestionLogic.Queries.GetQuestionLogic;

/// <summary>
/// Query to get all logic rules for a question.
/// </summary>
/// <param name="SurveyId">The survey ID.</param>
/// <param name="QuestionId">The question ID.</param>
public record GetQuestionLogicQuery(Guid SurveyId, Guid QuestionId)
    : IRequest<Result<IReadOnlyList<QuestionLogicDto>>>;
