using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SurveyApp.Application.Features.Responses.Commands.DeleteResponse;
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
        [FromQuery] bool? isCompleted = null,
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
                IsCompleted = isCompleted,
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
    /// Submit a survey response (can be anonymous)
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
}
