using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SurveyApp.API.Extensions;
using SurveyApp.Application.DTOs;
using SurveyApp.Application.Features.QuestionLogic.Commands.AddQuestionLogic;
using SurveyApp.Application.Features.QuestionLogic.Commands.RemoveQuestionLogic;
using SurveyApp.Application.Features.QuestionLogic.Commands.ReorderLogicPriority;
using SurveyApp.Application.Features.QuestionLogic.Commands.UpdateQuestionLogic;
using SurveyApp.Application.Features.QuestionLogic.Queries.EvaluateLogic;
using SurveyApp.Application.Features.QuestionLogic.Queries.GetQuestionLogic;
using SurveyApp.Application.Features.QuestionLogic.Queries.GetSurveyLogicMap;
using SurveyApp.Domain.Enums;

namespace SurveyApp.API.Controllers;

/// <summary>
/// Controller for managing survey question conditional logic.
/// </summary>
[ApiController]
[Route("api/surveys/{surveyId:guid}")]
[Authorize]
public class QuestionLogicController(IMediator mediator) : ControllerBase
{
    private readonly IMediator _mediator = mediator;

    /// <summary>
    /// Get all logic rules for a question.
    /// </summary>
    /// <param name="surveyId">The survey ID.</param>
    /// <param name="questionId">The question ID.</param>
    /// <returns>List of logic rules for the question.</returns>
    [HttpGet("questions/{questionId:guid}/logic")]
    [ProducesResponseType(typeof(IReadOnlyList<QuestionLogicDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetQuestionLogic(Guid surveyId, Guid questionId)
    {
        var result = await _mediator.Send(
            new GetQuestionLogicQuery { SurveyId = surveyId, QuestionId = questionId }
        );

        if (!result.IsSuccess)
            return result.ToProblemDetails(HttpContext);

        return Ok(result.Value);
    }

    /// <summary>
    /// Add conditional logic to a question.
    /// </summary>
    /// <param name="surveyId">The survey ID.</param>
    /// <param name="questionId">The question ID.</param>
    /// <param name="request">The logic rule details.</param>
    /// <returns>The created logic rule.</returns>
    [HttpPost("questions/{questionId:guid}/logic")]
    [ProducesResponseType(typeof(QuestionLogicDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> AddQuestionLogic(
        Guid surveyId,
        Guid questionId,
        [FromBody] AddQuestionLogicRequest request
    )
    {
        var command = new AddQuestionLogicCommand
        {
            SurveyId = surveyId,
            QuestionId = questionId,
            SourceQuestionId = request.SourceQuestionId,
            Operator = request.Operator,
            ConditionValue = request.ConditionValue,
            Action = request.Action,
            TargetQuestionId = request.TargetQuestionId,
            Priority = request.Priority,
        };

        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
            return result.ToProblemDetails(HttpContext);

        return CreatedAtAction(
            nameof(GetQuestionLogic),
            new { surveyId, questionId },
            result.Value
        );
    }

    /// <summary>
    /// Update an existing logic rule.
    /// </summary>
    /// <param name="surveyId">The survey ID.</param>
    /// <param name="questionId">The question ID.</param>
    /// <param name="logicId">The logic rule ID.</param>
    /// <param name="request">The updated logic rule details.</param>
    /// <returns>The updated logic rule.</returns>
    [HttpPut("questions/{questionId:guid}/logic/{logicId:guid}")]
    [ProducesResponseType(typeof(QuestionLogicDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateQuestionLogic(
        Guid surveyId,
        Guid questionId,
        Guid logicId,
        [FromBody] UpdateQuestionLogicRequest request
    )
    {
        var command = new UpdateQuestionLogicCommand
        {
            SurveyId = surveyId,
            QuestionId = questionId,
            LogicId = logicId,
            SourceQuestionId = request.SourceQuestionId,
            Operator = request.Operator,
            ConditionValue = request.ConditionValue,
            Action = request.Action,
            TargetQuestionId = request.TargetQuestionId,
            Priority = request.Priority,
        };

        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
            return result.ToProblemDetails(HttpContext);

        return Ok(result.Value);
    }

    /// <summary>
    /// Delete a logic rule.
    /// </summary>
    /// <param name="surveyId">The survey ID.</param>
    /// <param name="questionId">The question ID.</param>
    /// <param name="logicId">The logic rule ID.</param>
    /// <returns>No content on success.</returns>
    [HttpDelete("questions/{questionId:guid}/logic/{logicId:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteQuestionLogic(
        Guid surveyId,
        Guid questionId,
        Guid logicId
    )
    {
        var result = await _mediator.Send(
            new RemoveQuestionLogicCommand
            {
                SurveyId = surveyId,
                QuestionId = questionId,
                LogicId = logicId,
            }
        );

        if (!result.IsSuccess)
            return result.ToProblemDetails(HttpContext);

        return NoContent();
    }

    /// <summary>
    /// Reorder logic rules for a question.
    /// </summary>
    /// <param name="surveyId">The survey ID.</param>
    /// <param name="questionId">The question ID.</param>
    /// <param name="request">The ordered list of logic IDs.</param>
    /// <returns>No content on success.</returns>
    [HttpPut("questions/{questionId:guid}/logic/reorder")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ReorderLogic(
        Guid surveyId,
        Guid questionId,
        [FromBody] ReorderLogicRequest request
    )
    {
        var result = await _mediator.Send(
            new ReorderLogicPriorityCommand
            {
                SurveyId = surveyId,
                QuestionId = questionId,
                LogicIds = request.LogicIds,
            }
        );

        if (!result.IsSuccess)
            return result.ToProblemDetails(HttpContext);

        return NoContent();
    }

    /// <summary>
    /// Get the full logic map for a survey.
    /// </summary>
    /// <param name="surveyId">The survey ID.</param>
    /// <returns>The survey logic map for visualization.</returns>
    [HttpGet("logic-map")]
    [ProducesResponseType(typeof(SurveyLogicMapDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetSurveyLogicMap(Guid surveyId)
    {
        var result = await _mediator.Send(new GetSurveyLogicMapQuery { SurveyId = surveyId });

        if (!result.IsSuccess)
            return result.ToProblemDetails(HttpContext);

        return Ok(result.Value);
    }

    /// <summary>
    /// Evaluate logic for given answers.
    /// </summary>
    /// <param name="surveyId">The survey ID.</param>
    /// <param name="request">The evaluation request with answers.</param>
    /// <returns>The logic evaluation result.</returns>
    [HttpPost("evaluate-logic")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(LogicEvaluationResultDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> EvaluateLogic(
        Guid surveyId,
        [FromBody] EvaluateLogicRequest request
    )
    {
        var result = await _mediator.Send(
            new EvaluateLogicQuery
            {
                SurveyId = surveyId,
                CurrentQuestionId = request.CurrentQuestionId,
                Answers = request.Answers,
            }
        );

        if (!result.IsSuccess)
            return result.ToProblemDetails(HttpContext);

        return Ok(result.Value);
    }
}

#region Request DTOs

/// <summary>
/// Request DTO for adding question logic.
/// </summary>
public class AddQuestionLogicRequest
{
    /// <summary>
    /// The source question ID whose answer triggers this logic.
    /// </summary>
    public Guid SourceQuestionId { get; set; }

    /// <summary>
    /// The comparison operator.
    /// </summary>
    public LogicOperator Operator { get; set; }

    /// <summary>
    /// The value to compare against.
    /// </summary>
    public string ConditionValue { get; set; } = string.Empty;

    /// <summary>
    /// The action to take when condition is met.
    /// </summary>
    public LogicAction Action { get; set; }

    /// <summary>
    /// Optional target question ID for JumpTo action.
    /// </summary>
    public Guid? TargetQuestionId { get; set; }

    /// <summary>
    /// Optional priority for evaluation order.
    /// </summary>
    public int? Priority { get; set; }
}

/// <summary>
/// Request DTO for updating question logic.
/// </summary>
public class UpdateQuestionLogicRequest
{
    /// <summary>
    /// The source question ID whose answer triggers this logic.
    /// </summary>
    public Guid SourceQuestionId { get; set; }

    /// <summary>
    /// The comparison operator.
    /// </summary>
    public LogicOperator Operator { get; set; }

    /// <summary>
    /// The value to compare against.
    /// </summary>
    public string ConditionValue { get; set; } = string.Empty;

    /// <summary>
    /// The action to take when condition is met.
    /// </summary>
    public LogicAction Action { get; set; }

    /// <summary>
    /// Optional target question ID for JumpTo action.
    /// </summary>
    public Guid? TargetQuestionId { get; set; }

    /// <summary>
    /// Priority for evaluation order.
    /// </summary>
    public int Priority { get; set; }
}

/// <summary>
/// Request DTO for reordering logic rules.
/// </summary>
public class ReorderLogicRequest
{
    /// <summary>
    /// The ordered list of logic IDs (first = highest priority).
    /// </summary>
    public List<Guid> LogicIds { get; set; } = [];
}

/// <summary>
/// Request DTO for evaluating logic.
/// </summary>
public class EvaluateLogicRequest
{
    /// <summary>
    /// Optional current question ID (for determining next question).
    /// </summary>
    public Guid? CurrentQuestionId { get; set; }

    /// <summary>
    /// The answers to evaluate against.
    /// </summary>
    public List<AnswerForEvaluationDto> Answers { get; set; } = [];
}

#endregion
