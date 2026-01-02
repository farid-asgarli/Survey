using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SurveyApp.Application.DTOs;
using SurveyApp.Application.Features.Questions.Commands.BatchSyncQuestions;
using SurveyApp.Application.Features.Questions.Commands.CreateQuestion;
using SurveyApp.Application.Features.Questions.Commands.DeleteQuestion;
using SurveyApp.Application.Features.Questions.Commands.ReorderQuestions;
using SurveyApp.Application.Features.Questions.Commands.UpdateQuestion;
using SurveyApp.Application.Features.Questions.Queries.GetQuestionById;
using SurveyApp.Application.Features.Questions.Queries.GetQuestions;

namespace SurveyApp.API.Controllers;

/// <summary>
/// Controller for managing survey questions.
/// </summary>
[ApiController]
[Route("api/surveys/{surveyId:guid}/questions")]
[Authorize]
public class QuestionsController(IMediator mediator) : ApiControllerBase
{
    private readonly IMediator _mediator = mediator;

    /// <summary>
    /// Get all questions in a survey.
    /// </summary>
    /// <param name="surveyId">The survey ID.</param>
    /// <returns>List of questions in the survey.</returns>
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<QuestionDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetQuestions(Guid surveyId)
    {
        var result = await _mediator.Send(new GetQuestionsQuery(surveyId));

        return HandleResult(result);
    }

    /// <summary>
    /// Get a specific question by ID.
    /// </summary>
    /// <param name="surveyId">The survey ID.</param>
    /// <param name="questionId">The question ID.</param>
    /// <returns>The question details.</returns>
    [HttpGet("{questionId:guid}")]
    [ProducesResponseType(typeof(QuestionDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetQuestion(Guid surveyId, Guid questionId)
    {
        var result = await _mediator.Send(new GetQuestionByIdQuery(surveyId, questionId));

        return HandleResult(result);
    }

    /// <summary>
    /// Create a new question in a survey.
    /// </summary>
    /// <param name="surveyId">The survey ID.</param>
    /// <param name="command">The question command.</param>
    /// <returns>The created question.</returns>
    [HttpPost]
    [ProducesResponseType(typeof(QuestionDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> CreateQuestion(
        Guid surveyId,
        [FromBody] CreateQuestionCommand command
    )
    {
        var result = await _mediator.Send(command with { SurveyId = surveyId });

        return HandleCreatedResult(
            result,
            nameof(GetQuestion),
            v => new { surveyId, questionId = v.Id }
        );
    }

    /// <summary>
    /// Update a question in a survey.
    /// </summary>
    /// <param name="surveyId">The survey ID.</param>
    /// <param name="questionId">The question ID.</param>
    /// <param name="command">The updated question command.</param>
    /// <returns>The updated question.</returns>
    [HttpPut("{questionId:guid}")]
    [ProducesResponseType(typeof(QuestionDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateQuestion(
        Guid surveyId,
        Guid questionId,
        [FromBody] UpdateQuestionCommand command
    )
    {
        var result = await _mediator.Send(
            command with
            {
                SurveyId = surveyId,
                QuestionId = questionId,
            }
        );

        return HandleResult(result);
    }

    /// <summary>
    /// Delete a question from a survey.
    /// </summary>
    /// <param name="surveyId">The survey ID.</param>
    /// <param name="questionId">The question ID.</param>
    [HttpDelete("{questionId:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteQuestion(Guid surveyId, Guid questionId)
    {
        var result = await _mediator.Send(
            new DeleteQuestionCommand { SurveyId = surveyId, QuestionId = questionId }
        );

        return HandleNoContentResult(result);
    }

    /// <summary>
    /// Reorder questions in a survey.
    /// </summary>
    /// <param name="surveyId">The survey ID.</param>
    /// <param name="command">The reorder command with question IDs.</param>
    [HttpPut("reorder")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ReorderQuestions(
        Guid surveyId,
        [FromBody] ReorderQuestionsCommand command
    )
    {
        var result = await _mediator.Send(command with { SurveyId = surveyId });

        return HandleNoContentResult(result);
    }

    /// <summary>
    /// Batch sync questions in a survey.
    /// Handles creates, updates, deletes, and reordering in a single atomic operation.
    /// This is more efficient than making multiple individual API calls.
    /// </summary>
    /// <param name="surveyId">The survey ID.</param>
    /// <param name="command">The batch sync command.</param>
    /// <returns>Result of the batch sync operation including ID mappings.</returns>
    [HttpPost("sync")]
    [ProducesResponseType(typeof(BatchSyncQuestionsResult), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> BatchSyncQuestions(
        Guid surveyId,
        [FromBody] BatchSyncQuestionsCommand command
    )
    {
        var result = await _mediator.Send(command with { SurveyId = surveyId });

        return HandleResult(result);
    }
}
