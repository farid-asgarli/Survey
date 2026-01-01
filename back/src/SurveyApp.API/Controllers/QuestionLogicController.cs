using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SurveyApp.Application.DTOs;
using SurveyApp.Application.Features.QuestionLogic.Commands.AddQuestionLogic;
using SurveyApp.Application.Features.QuestionLogic.Commands.RemoveQuestionLogic;
using SurveyApp.Application.Features.QuestionLogic.Commands.ReorderLogicPriority;
using SurveyApp.Application.Features.QuestionLogic.Commands.UpdateQuestionLogic;
using SurveyApp.Application.Features.QuestionLogic.Queries.EvaluateLogic;
using SurveyApp.Application.Features.QuestionLogic.Queries.GetQuestionLogic;
using SurveyApp.Application.Features.QuestionLogic.Queries.GetSurveyLogicMap;

namespace SurveyApp.API.Controllers;

/// <summary>
/// Controller for managing survey question conditional logic.
/// </summary>
[ApiController]
[Route("api/surveys/{surveyId:guid}")]
[Authorize]
public class QuestionLogicController(IMediator mediator) : ApiControllerBase
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
        var result = await _mediator.Send(new GetQuestionLogicQuery(surveyId, questionId));

        return HandleResult(result);
    }

    /// <summary>
    /// Add conditional logic to a question.
    /// </summary>
    /// <param name="surveyId">The survey ID.</param>
    /// <param name="questionId">The question ID.</param>
    /// <param name="command">The logic rule command.</param>
    /// <returns>The created logic rule.</returns>
    [HttpPost("questions/{questionId:guid}/logic")]
    [ProducesResponseType(typeof(QuestionLogicDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> AddQuestionLogic(
        Guid surveyId,
        Guid questionId,
        [FromBody] AddQuestionLogicCommand command
    )
    {
        var result = await _mediator.Send(
            command with
            {
                SurveyId = surveyId,
                QuestionId = questionId,
            }
        );

        return HandleCreatedResult(result, nameof(GetQuestionLogic), new { surveyId, questionId });
    }

    /// <summary>
    /// Update an existing logic rule.
    /// </summary>
    /// <param name="surveyId">The survey ID.</param>
    /// <param name="questionId">The question ID.</param>
    /// <param name="logicId">The logic rule ID.</param>
    /// <param name="command">The updated logic rule command.</param>
    /// <returns>The updated logic rule.</returns>
    [HttpPut("questions/{questionId:guid}/logic/{logicId:guid}")]
    [ProducesResponseType(typeof(QuestionLogicDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateQuestionLogic(
        Guid surveyId,
        Guid questionId,
        Guid logicId,
        [FromBody] UpdateQuestionLogicCommand command
    )
    {
        var result = await _mediator.Send(
            command with
            {
                SurveyId = surveyId,
                QuestionId = questionId,
                LogicId = logicId,
            }
        );
        return HandleResult(result);
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

        return HandleNoContentResult(result);
    }

    /// <summary>
    /// Reorder logic rules for a question.
    /// </summary>
    /// <param name="surveyId">The survey ID.</param>
    /// <param name="questionId">The question ID.</param>
    /// <param name="command">The reorder command with logic IDs.</param>
    /// <returns>No content on success.</returns>
    [HttpPut("questions/{questionId:guid}/logic/reorder")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ReorderLogic(
        Guid surveyId,
        Guid questionId,
        [FromBody] ReorderLogicPriorityCommand command
    )
    {
        var result = await _mediator.Send(
            command with
            {
                SurveyId = surveyId,
                QuestionId = questionId,
            }
        );

        return HandleNoContentResult(result);
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
        var result = await _mediator.Send(new GetSurveyLogicMapQuery(surveyId));
        return HandleResult(result);
    }

    /// <summary>
    /// Evaluate logic for given answers.
    /// </summary>
    /// <param name="surveyId">The survey ID.</param>
    /// <param name="query">The evaluation query with answers.</param>
    /// <returns>The logic evaluation result.</returns>
    [HttpPost("evaluate-logic")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(LogicEvaluationResultDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> EvaluateLogic(
        Guid surveyId,
        [FromBody] EvaluateLogicQuery query
    )
    {
        var result = await _mediator.Send(query with { SurveyId = surveyId });
        return HandleResult(result);
    }
}
