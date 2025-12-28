using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.DTOs;

namespace SurveyApp.Application.Features.QuestionLogic.Queries.GetQuestionLogic;

/// <summary>
/// Query to get all logic rules for a question.
/// </summary>
public record GetQuestionLogicQuery : IRequest<Result<IReadOnlyList<QuestionLogicDto>>>
{
    /// <summary>
    /// The survey ID.
    /// </summary>
    public Guid SurveyId { get; init; }

    /// <summary>
    /// The question ID.
    /// </summary>
    public Guid QuestionId { get; init; }
}
