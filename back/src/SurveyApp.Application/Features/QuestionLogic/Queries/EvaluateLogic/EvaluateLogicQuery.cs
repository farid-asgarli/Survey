using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.DTOs;

namespace SurveyApp.Application.Features.QuestionLogic.Queries.EvaluateLogic;

/// <summary>
/// Query to evaluate logic for given answers.
/// </summary>
public record EvaluateLogicQuery : IRequest<Result<LogicEvaluationResultDto>>
{
    /// <summary>
    /// The survey ID.
    /// </summary>
    public Guid SurveyId { get; init; }

    /// <summary>
    /// Optional current question ID (for determining next question).
    /// </summary>
    public Guid? CurrentQuestionId { get; init; }

    /// <summary>
    /// The answers to evaluate against.
    /// </summary>
    public List<AnswerForEvaluationDto> Answers { get; init; } = [];
}
