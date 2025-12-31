using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SurveyApp.API.Extensions;
using SurveyApp.Application.DTOs;
using SurveyApp.Application.Features.Questions.Commands.BatchSyncQuestions;
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

    /// <summary>
    /// Batch sync questions in a survey.
    /// Handles creates, updates, deletes, and reordering in a single atomic operation.
    /// This is more efficient than making multiple individual API calls.
    /// </summary>
    /// <param name="surveyId">The survey ID.</param>
    /// <param name="request">The batch sync data.</param>
    /// <returns>Result of the batch sync operation including ID mappings.</returns>
    [HttpPost("sync")]
    [ProducesResponseType(typeof(BatchSyncQuestionsResult), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> BatchSyncQuestions(
        Guid surveyId,
        [FromBody] BatchSyncQuestionsRequest request
    )
    {
        var command = new BatchSyncQuestionsCommand
        {
            SurveyId = surveyId,
            ToCreate =
            [
                .. request.ToCreate.Select(c => new CreateQuestionData
                {
                    TempId = c.TempId,
                    Text = c.Text,
                    Description = c.Description,
                    Type = c.Type,
                    IsRequired = c.IsRequired,
                    Order = c.Order,
                    Settings = c.Settings,
                    IsNpsQuestion = c.IsNpsQuestion,
                    NpsType = c.NpsType,
                    LanguageCode = c.LanguageCode,
                }),
            ],
            ToUpdate =
            [
                .. request.ToUpdate.Select(u => new UpdateQuestionData
                {
                    QuestionId = u.QuestionId,
                    Text = u.Text,
                    Description = u.Description,
                    Type = u.Type,
                    IsRequired = u.IsRequired,
                    Order = u.Order,
                    Settings = u.Settings,
                    IsNpsQuestion = u.IsNpsQuestion,
                    NpsType = u.NpsType,
                    LanguageCode = u.LanguageCode,
                }),
            ],
            ToDelete = request.ToDelete,
            FinalOrder = request.FinalOrder,
        };

        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
            return result.ToProblemDetails(HttpContext);

        return Ok(result.Value);
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

/// <summary>
/// Request body for batch syncing questions.
/// </summary>
public class BatchSyncQuestionsRequest
{
    /// <summary>
    /// Questions to create (new questions with temporary client-side IDs).
    /// </summary>
    public List<BatchCreateQuestionData> ToCreate { get; set; } = [];

    /// <summary>
    /// Questions to update (existing questions with real IDs).
    /// </summary>
    public List<BatchUpdateQuestionData> ToUpdate { get; set; } = [];

    /// <summary>
    /// Question IDs to delete.
    /// </summary>
    public List<Guid> ToDelete { get; set; } = [];

    /// <summary>
    /// The final order of question IDs after sync.
    /// Temporary IDs (starting with "temp_") will be mapped to real IDs.
    /// </summary>
    public List<string> FinalOrder { get; set; } = [];
}

/// <summary>
/// Data for creating a question in batch sync.
/// </summary>
public class BatchCreateQuestionData
{
    /// <summary>
    /// Temporary ID used by the client to track this question.
    /// </summary>
    public string TempId { get; set; } = string.Empty;
    public string Text { get; set; } = string.Empty;
    public string? Description { get; set; }
    public QuestionType Type { get; set; }
    public bool IsRequired { get; set; }
    public int? Order { get; set; }
    public QuestionSettingsDto? Settings { get; set; }
    public bool IsNpsQuestion { get; set; }
    public NpsQuestionType? NpsType { get; set; }
    public string? LanguageCode { get; set; }
}

/// <summary>
/// Data for updating a question in batch sync.
/// </summary>
public class BatchUpdateQuestionData
{
    public Guid QuestionId { get; set; }
    public string Text { get; set; } = string.Empty;
    public string? Description { get; set; }
    public QuestionType Type { get; set; }
    public bool IsRequired { get; set; }
    public int? Order { get; set; }
    public QuestionSettingsDto? Settings { get; set; }
    public bool IsNpsQuestion { get; set; }
    public NpsQuestionType? NpsType { get; set; }
    public string? LanguageCode { get; set; }
}
