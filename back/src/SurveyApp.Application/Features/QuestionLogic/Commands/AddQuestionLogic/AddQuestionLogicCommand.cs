using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.DTOs;
using SurveyApp.Domain.Enums;

namespace SurveyApp.Application.Features.QuestionLogic.Commands.AddQuestionLogic;

/// <summary>
/// Command to add conditional logic to a question.
/// </summary>
public record AddQuestionLogicCommand : IRequest<Result<QuestionLogicDto>>
{
    /// <summary>
    /// The survey ID.
    /// </summary>
    public Guid SurveyId { get; init; }

    /// <summary>
    /// The question ID to which this logic applies.
    /// </summary>
    public Guid QuestionId { get; init; }

    /// <summary>
    /// The source question ID whose answer triggers this logic.
    /// </summary>
    public Guid SourceQuestionId { get; init; }

    /// <summary>
    /// The comparison operator.
    /// </summary>
    public LogicOperator Operator { get; init; }

    /// <summary>
    /// The value to compare against.
    /// </summary>
    public string ConditionValue { get; init; } = string.Empty;

    /// <summary>
    /// The action to take when condition is met.
    /// </summary>
    public LogicAction Action { get; init; }

    /// <summary>
    /// Optional target question ID for JumpTo action.
    /// </summary>
    public Guid? TargetQuestionId { get; init; }

    /// <summary>
    /// Optional priority for evaluation order.
    /// </summary>
    public int? Priority { get; init; }
}
