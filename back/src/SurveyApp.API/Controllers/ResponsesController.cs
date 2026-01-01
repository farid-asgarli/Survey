using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SurveyApp.API.Extensions;
using SurveyApp.Application.DTOs;
using SurveyApp.Application.DTOs.Common;
using SurveyApp.Application.Features.Responses.Commands.BulkDeleteResponses;
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
    [ProducesResponseType(typeof(PagedResponse<ResponseListItemDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetResponses([FromQuery] GetResponsesQuery query)
    {
        var result = await _mediator.Send(query);
        return HandleResult(result);
    }

    /// <summary>
    /// Get a response by ID
    /// </summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(SurveyResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _mediator.Send(new GetResponseByIdQuery(id));
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
        [FromBody] SubmitSurveyResponseCommand command
    )
    {
        var result = await _mediator.Send(command with { ResponseId = id });
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
        var result = await _mediator.Send(new DeleteResponseCommand(id));
        return HandleNoContentResult(result);
    }

    /// <summary>
    /// Delete multiple responses in bulk
    /// </summary>
    [HttpPost("bulk-delete")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> BulkDelete([FromBody] BulkDeleteResponsesCommand command)
    {
        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
            return result.ToProblemDetails(HttpContext);

        // Return NoContent if all deletions succeeded, otherwise return the partial result
        if (result.Value!.IsComplete)
            return NoContent();

        return Ok(result.Value);
    }
}
