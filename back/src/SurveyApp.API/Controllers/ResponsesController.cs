using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SurveyApp.API.Extensions;
using SurveyApp.Application.Features.Responses.Commands.DeleteResponse;
using SurveyApp.Application.Features.Responses.Commands.StartResponse;
using SurveyApp.Application.Features.Responses.Commands.SubmitResponse;
using SurveyApp.Application.Features.Responses.Queries.GetResponseById;
using SurveyApp.Application.Features.Responses.Queries.GetResponses;

namespace SurveyApp.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize] // Class-level authorization - individual endpoints can override with [AllowAnonymous]
public class ResponsesController(IMediator mediator) : ApiControllerBase
{
    private readonly IMediator _mediator = mediator;

    /// <summary>
    /// Get responses for a survey
    /// </summary>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetResponses(
        [FromQuery] Guid surveyId,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] bool? isComplete = null,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null
    )
    {
        var result = await _mediator.Send(
            new GetResponsesQuery
            {
                SurveyId = surveyId,
                PageNumber = pageNumber,
                PageSize = pageSize,
                IsComplete = isComplete,
                FromDate = fromDate,
                ToDate = toDate,
            }
        );
        return HandleResult(result);
    }

    /// <summary>
    /// Get a response by ID
    /// </summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _mediator.Send(new GetResponseByIdQuery { ResponseId = id });
        return HandleResult(result);
    }

    /// <summary>
    /// Start a new survey response (creates a draft response).
    /// Call this when a respondent begins taking a survey.
    /// Returns a responseId to use when submitting the completed response.
    /// </summary>
    [HttpPost("start")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(StartResponseResult), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Start([FromBody] StartResponseCommand command)
    {
        // Enrich command with request metadata for analytics
        var enrichedCommand = command with
        {
            IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString(),
            UserAgent = Request.Headers.UserAgent.ToString(),
            Referrer = Request.Headers.Referer.ToString(),
        };

        var result = await _mediator.Send(enrichedCommand);

        if (!result.IsSuccess)
            return result.ToProblemDetails(HttpContext);

        return CreatedAtAction(
            nameof(GetById),
            new { id = result.Value!.ResponseId },
            result.Value
        );
    }

    /// <summary>
    /// Submit/complete a survey response.
    /// Can either complete an existing draft response (responseId in body)
    /// or create and complete in one step (surveyId in body - legacy flow).
    /// </summary>
    [HttpPost]
    [AllowAnonymous]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Submit([FromBody] SubmitSurveyResponseCommand command)
    {
        var result = await _mediator.Send(command);
        return HandleCreatedResult(result, nameof(GetById), v => new { id = v.Id });
    }

    /// <summary>
    /// Submit/complete an existing draft response by ID.
    /// Alternative endpoint for completing a response started with POST /start.
    /// </summary>
    [HttpPost("{id:guid}/submit")]
    [AllowAnonymous]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> SubmitById(
        Guid id,
        [FromBody] SubmitResponseByIdRequest request
    )
    {
        var command = new SubmitSurveyResponseCommand
        {
            ResponseId = id,
            Answers = request.Answers,
            Metadata = request.Metadata,
        };

        var result = await _mediator.Send(command);
        return HandleResult(result);
    }

    /// <summary>
    /// Delete a response
    /// </summary>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id)
    {
        var result = await _mediator.Send(new DeleteResponseCommand { ResponseId = id });
        return HandleNoContentResult(result);
    }

    /// <summary>
    /// Delete multiple responses in bulk
    /// </summary>
    [HttpPost("bulk-delete")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> BulkDelete([FromBody] BulkDeleteResponsesRequest request)
    {
        if (request.ResponseIds == null || request.ResponseIds.Count == 0)
        {
            return BadRequest("At least one response ID is required.");
        }

        var errors = new List<string>();

        foreach (var responseId in request.ResponseIds)
        {
            var result = await _mediator.Send(
                new DeleteResponseCommand { ResponseId = responseId }
            );
            if (!result.IsSuccess)
            {
                errors.Add($"Failed to delete response {responseId}: {result.Error}");
            }
        }

        if (errors.Count > 0 && errors.Count == request.ResponseIds.Count)
        {
            // All deletions failed
            return BadRequest(new { message = "All deletions failed", errors });
        }

        // Return success even if some failed (partial success)
        return NoContent();
    }
}

/// <summary>
/// Request body for bulk deleting responses.
/// </summary>
public class BulkDeleteResponsesRequest
{
    /// <summary>
    /// The survey ID (for authorization purposes).
    /// </summary>
    public Guid SurveyId { get; init; }

    /// <summary>
    /// The IDs of the responses to delete.
    /// </summary>
    public List<Guid> ResponseIds { get; init; } = [];
}

/// <summary>
/// Request body for submitting a response by ID.
/// </summary>
public class SubmitResponseByIdRequest
{
    /// <summary>
    /// The answers to submit.
    /// </summary>
    public List<SubmitAnswerDto> Answers { get; init; } = [];

    /// <summary>
    /// Optional metadata.
    /// </summary>
    public Dictionary<string, string>? Metadata { get; init; }
}
