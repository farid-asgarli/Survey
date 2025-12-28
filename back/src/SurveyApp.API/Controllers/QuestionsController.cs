using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SurveyApp.API.Extensions;
using SurveyApp.Application.DTOs;
using SurveyApp.Application.Features.Questions.Commands.CreateQuestion;
using SurveyApp.Application.Features.Questions.Commands.DeleteQuestion;
using SurveyApp.Application.Features.Questions.Commands.ReorderQuestions;
using SurveyApp.Application.Features.Questions.Commands.UpdateQuestion;
using SurveyApp.Application.Features.Questions.Queries.GetQuestionById;
using SurveyApp.Application.Features.Questions.Queries.GetQuestions;
using SurveyApp.Domain.Enums;

namespace SurveyApp.API.Controllers;

/// <summary>
/// Controller for managing survey questions.
/// </summary>
[ApiController]
[Route("api/surveys/{surveyId:guid}/questions")]
[Authorize]
public class QuestionsController(IMediator mediator) : ControllerBase
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
        var result = await _mediator.Send(new GetQuestionsQuery { SurveyId = surveyId });

        if (!result.IsSuccess)
            return result.ToProblemDetails(HttpContext);

        return Ok(result.Value);
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
        var result = await _mediator.Send(
            new GetQuestionByIdQuery { SurveyId = surveyId, QuestionId = questionId }
        );

        if (!result.IsSuccess)
            return result.ToProblemDetails(HttpContext);

        return Ok(result.Value);
    }

    /// <summary>
    /// Create a new question in a survey.
    /// </summary>
    /// <param name="surveyId">The survey ID.</param>
    /// <param name="request">The question data.</param>
    /// <returns>The created question.</returns>
    [HttpPost]
    [ProducesResponseType(typeof(QuestionDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> CreateQuestion(
        Guid surveyId,
        [FromBody] CreateQuestionRequest request
    )
    {
        var command = new CreateQuestionCommand
        {
            SurveyId = surveyId,
            Text = request.Text,
            Description = request.Description,
            Type = request.Type,
            IsRequired = request.IsRequired,
            Order = request.Order,
            Settings = request.Settings,
            IsNpsQuestion = request.IsNpsQuestion,
            NpsType = request.NpsType,
        };

        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
            return result.ToProblemDetails(HttpContext);

        return CreatedAtAction(
            nameof(GetQuestion),
            new { surveyId, questionId = result.Value!.Id },
            result.Value
        );
    }

    /// <summary>
    /// Update a question in a survey.
    /// </summary>
    /// <param name="surveyId">The survey ID.</param>
    /// <param name="questionId">The question ID.</param>
    /// <param name="request">The updated question data.</param>
    /// <returns>The updated question.</returns>
    [HttpPut("{questionId:guid}")]
    [ProducesResponseType(typeof(QuestionDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateQuestion(
        Guid surveyId,
        Guid questionId,
        [FromBody] UpdateQuestionRequest request
    )
    {
        var command = new UpdateQuestionCommand
        {
            SurveyId = surveyId,
            QuestionId = questionId,
            Text = request.Text,
            Description = request.Description,
            Type = request.Type,
            IsRequired = request.IsRequired,
            Order = request.Order,
            Settings = request.Settings,
            IsNpsQuestion = request.IsNpsQuestion,
            NpsType = request.NpsType,
        };

        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
            return result.ToProblemDetails(HttpContext);

        return Ok(result.Value);
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

        if (!result.IsSuccess)
            return result.ToProblemDetails(HttpContext);

        return NoContent();
    }

    /// <summary>
    /// Reorder questions in a survey.
    /// </summary>
    /// <param name="surveyId">The survey ID.</param>
    /// <param name="request">The new question order.</param>
    [HttpPut("reorder")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ReorderQuestions(
        Guid surveyId,
        [FromBody] ReorderQuestionsRequest request
    )
    {
        var result = await _mediator.Send(
            new ReorderQuestionsCommand { SurveyId = surveyId, QuestionIds = request.QuestionIds }
        );

        if (!result.IsSuccess)
            return result.ToProblemDetails(HttpContext);

        return NoContent();
    }
}

/// <summary>
/// Request body for creating a question.
/// </summary>
public class CreateQuestionRequest
{
    public string Text { get; set; } = string.Empty;
    public string? Description { get; set; }
    public QuestionType Type { get; set; }
    public bool IsRequired { get; set; }
    public int? Order { get; set; }
    public QuestionSettingsDto? Settings { get; set; }
    public bool IsNpsQuestion { get; set; }
    public NpsQuestionType? NpsType { get; set; }
}

/// <summary>
/// Request body for updating a question.
/// </summary>
public class UpdateQuestionRequest
{
    public string Text { get; set; } = string.Empty;
    public string? Description { get; set; }
    public QuestionType Type { get; set; }
    public bool IsRequired { get; set; }
    public int? Order { get; set; }
    public QuestionSettingsDto? Settings { get; set; }
    public bool IsNpsQuestion { get; set; }
    public NpsQuestionType? NpsType { get; set; }
}

/// <summary>
/// Request body for reordering questions.
/// </summary>
public class ReorderQuestionsRequest
{
    public List<Guid> QuestionIds { get; set; } = [];
}
