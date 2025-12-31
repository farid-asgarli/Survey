using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SurveyApp.Application.Features.RecurringSurveys.Commands.CreateRecurringSurvey;
using SurveyApp.Application.Features.RecurringSurveys.Commands.DeleteRecurringSurvey;
using SurveyApp.Application.Features.RecurringSurveys.Commands.PauseRecurringSurvey;
using SurveyApp.Application.Features.RecurringSurveys.Commands.ResumeRecurringSurvey;
using SurveyApp.Application.Features.RecurringSurveys.Commands.TriggerRecurringSurvey;
using SurveyApp.Application.Features.RecurringSurveys.Commands.UpdateRecurringSurvey;
using SurveyApp.Application.Features.RecurringSurveys.Queries.GetRecurringSurveyById;
using SurveyApp.Application.Features.RecurringSurveys.Queries.GetRecurringSurveyRunById;
using SurveyApp.Application.Features.RecurringSurveys.Queries.GetRecurringSurveyRuns;
using SurveyApp.Application.Features.RecurringSurveys.Queries.GetRecurringSurveys;
using SurveyApp.Application.Features.RecurringSurveys.Queries.GetUpcomingRuns;

namespace SurveyApp.API.Controllers;

/// <summary>
/// Controller for managing recurring surveys.
/// </summary>
[ApiController]
[Route("api/recurring-surveys")]
[Authorize]
public class RecurringSurveysController(IMediator mediator) : ApiControllerBase
{
    private readonly IMediator _mediator = mediator;

    /// <summary>
    /// Get all recurring surveys in the current namespace.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetRecurringSurveys(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? searchTerm = null,
        [FromQuery] bool? isActive = null
    )
    {
        var result = await _mediator.Send(
            new GetRecurringSurveysQuery
            {
                PageNumber = pageNumber,
                PageSize = pageSize,
                SearchTerm = searchTerm,
                IsActive = isActive,
            }
        );

        return HandleResult(result);
    }

    /// <summary>
    /// Get upcoming scheduled runs.
    /// </summary>
    [HttpGet("upcoming")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetUpcomingRuns([FromQuery] int count = 10)
    {
        var result = await _mediator.Send(new GetUpcomingRunsQuery { Count = count });

        return HandleResult(result);
    }

    /// <summary>
    /// Get a recurring survey by ID.
    /// </summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _mediator.Send(new GetRecurringSurveyByIdQuery { Id = id });

        return HandleResult(result);
    }

    /// <summary>
    /// Create a new recurring survey.
    /// </summary>
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] CreateRecurringSurveyCommand command)
    {
        var result = await _mediator.Send(command);

        return HandleCreatedResult(result, nameof(GetById), v => new { id = v.Id });
    }

    /// <summary>
    /// Update a recurring survey.
    /// </summary>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(
        Guid id,
        [FromBody] UpdateRecurringSurveyCommand command
    )
    {
        if (id != command.Id)
            return IdMismatchError();

        var result = await _mediator.Send(command);

        return HandleResult(result);
    }

    /// <summary>
    /// Delete a recurring survey.
    /// </summary>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id)
    {
        var result = await _mediator.Send(new DeleteRecurringSurveyCommand { Id = id });

        return HandleNoContentResult(result);
    }

    /// <summary>
    /// Pause a recurring survey.
    /// </summary>
    [HttpPost("{id:guid}/pause")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Pause(Guid id)
    {
        var result = await _mediator.Send(new PauseRecurringSurveyCommand { Id = id });

        return HandleResult(result);
    }

    /// <summary>
    /// Resume a paused recurring survey.
    /// </summary>
    [HttpPost("{id:guid}/resume")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Resume(Guid id)
    {
        var result = await _mediator.Send(new ResumeRecurringSurveyCommand { Id = id });

        return HandleResult(result);
    }

    /// <summary>
    /// Trigger an immediate run of a recurring survey.
    /// </summary>
    [HttpPost("{id:guid}/trigger")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Trigger(Guid id)
    {
        var result = await _mediator.Send(new TriggerRecurringSurveyCommand { Id = id });

        return HandleResult(result);
    }

    /// <summary>
    /// Get run history for a recurring survey.
    /// </summary>
    [HttpGet("{id:guid}/runs")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetRuns(
        Guid id,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10
    )
    {
        var result = await _mediator.Send(
            new GetRecurringSurveyRunsQuery
            {
                RecurringSurveyId = id,
                PageNumber = pageNumber,
                PageSize = pageSize,
            }
        );

        return HandleResult(result);
    }

    /// <summary>
    /// Get a specific run by ID.
    /// </summary>
    [HttpGet("{id:guid}/runs/{runId:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetRunById(Guid id, Guid runId)
    {
        var result = await _mediator.Send(
            new GetRecurringSurveyRunByIdQuery { RecurringSurveyId = id, RunId = runId }
        );

        return HandleResult(result);
    }
}
