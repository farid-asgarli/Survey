using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SurveyApp.Application.DTOs;
using SurveyApp.Application.DTOs.Common;
using SurveyApp.Application.Features.EmailDistributions.Commands.CancelDistribution;
using SurveyApp.Application.Features.EmailDistributions.Commands.CreateDistribution;
using SurveyApp.Application.Features.EmailDistributions.Commands.DeleteDistribution;
using SurveyApp.Application.Features.EmailDistributions.Commands.ScheduleDistribution;
using SurveyApp.Application.Features.EmailDistributions.Commands.SendDistribution;
using SurveyApp.Application.Features.EmailDistributions.Queries.GetDistributionById;
using SurveyApp.Application.Features.EmailDistributions.Queries.GetDistributionRecipients;
using SurveyApp.Application.Features.EmailDistributions.Queries.GetDistributions;
using SurveyApp.Application.Features.EmailDistributions.Queries.GetDistributionStats;
using SurveyApp.Domain.Enums;

namespace SurveyApp.API.Controllers;

/// <summary>
/// Controller for managing email distributions for surveys.
/// </summary>
[ApiController]
[Route("api/surveys/{surveyId:guid}/distributions")]
[Authorize]
public class EmailDistributionsController(IMediator mediator) : ApiControllerBase
{
    private readonly IMediator _mediator = mediator;

    /// <summary>
    /// Gets all distributions for a survey.
    /// </summary>
    /// <param name="surveyId">The survey ID.</param>
    /// <param name="query">Query parameters for pagination.</param>
    /// <returns>List of distributions.</returns>
    [HttpGet]
    [ProducesResponseType(
        typeof(PagedResponse<EmailDistributionSummaryDto>),
        StatusCodes.Status200OK
    )]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetDistributions(
        Guid surveyId,
        [FromQuery] GetDistributionsQuery query
    )
    {
        var result = await _mediator.Send(query with { SurveyId = surveyId });
        return HandleResult(result);
    }

    /// <summary>
    /// Gets a distribution by its ID.
    /// </summary>
    /// <param name="surveyId">The survey ID.</param>
    /// <param name="distId">The distribution ID.</param>
    /// <returns>The distribution details.</returns>
    [HttpGet("{distId:guid}")]
    [ProducesResponseType(typeof(EmailDistributionDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetDistributionById(Guid surveyId, Guid distId)
    {
        var result = await _mediator.Send(new GetDistributionByIdQuery(surveyId, distId));

        return HandleResult(result);
    }

    /// <summary>
    /// Creates a new email distribution.
    /// </summary>
    /// <param name="surveyId">The survey ID.</param>
    /// <param name="command">The distribution command.</param>
    /// <returns>The created distribution.</returns>
    [HttpPost]
    [ProducesResponseType(typeof(EmailDistributionDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateDistribution(
        Guid surveyId,
        [FromBody] CreateDistributionCommand command
    )
    {
        var result = await _mediator.Send(command with { SurveyId = surveyId });

        return HandleCreatedResult(
            result,
            nameof(GetDistributionById),
            v => new { surveyId, distId = v.Id }
        );
    }

    /// <summary>
    /// Schedules a distribution to be sent at a specific time.
    /// </summary>
    /// <param name="surveyId">The survey ID.</param>
    /// <param name="distId">The distribution ID.</param>
    /// <param name="command">The schedule command.</param>
    /// <returns>The updated distribution.</returns>
    [HttpPost("{distId:guid}/schedule")]
    [ProducesResponseType(typeof(EmailDistributionDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ScheduleDistribution(
        Guid surveyId,
        Guid distId,
        [FromBody] ScheduleDistributionCommand command
    )
    {
        var result = await _mediator.Send(
            command with
            {
                SurveyId = surveyId,
                DistributionId = distId,
            }
        );

        return HandleResult(result);
    }

    /// <summary>
    /// Sends a distribution immediately.
    /// </summary>
    /// <param name="surveyId">The survey ID.</param>
    /// <param name="distId">The distribution ID.</param>
    /// <returns>The updated distribution.</returns>
    [HttpPost("{distId:guid}/send")]
    [ProducesResponseType(typeof(EmailDistributionDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> SendDistribution(Guid surveyId, Guid distId)
    {
        var result = await _mediator.Send(new SendDistributionCommand(surveyId, distId));

        return HandleResult(result);
    }

    /// <summary>
    /// Cancels a scheduled distribution.
    /// </summary>
    /// <param name="surveyId">The survey ID.</param>
    /// <param name="distId">The distribution ID.</param>
    /// <returns>No content.</returns>
    [HttpPost("{distId:guid}/cancel")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> CancelDistribution(Guid surveyId, Guid distId)
    {
        var result = await _mediator.Send(new CancelDistributionCommand(surveyId, distId));

        return HandleNoContentResult(result);
    }

    /// <summary>
    /// Deletes a distribution.
    /// </summary>
    /// <param name="surveyId">The survey ID.</param>
    /// <param name="distId">The distribution ID.</param>
    /// <returns>No content.</returns>
    [HttpDelete("{distId:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteDistribution(Guid surveyId, Guid distId)
    {
        var result = await _mediator.Send(new DeleteDistributionCommand(surveyId, distId));

        return HandleNoContentResult(result);
    }

    /// <summary>
    /// Gets distribution statistics.
    /// </summary>
    /// <param name="surveyId">The survey ID.</param>
    /// <param name="distId">The distribution ID.</param>
    /// <returns>The distribution statistics.</returns>
    [HttpGet("{distId:guid}/stats")]
    [ProducesResponseType(typeof(DistributionStatsDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetDistributionStats(Guid surveyId, Guid distId)
    {
        var result = await _mediator.Send(new GetDistributionStatsQuery(surveyId, distId));

        return HandleResult(result);
    }

    /// <summary>
    /// Gets recipients for a distribution.
    /// </summary>
    /// <param name="surveyId">The survey ID.</param>
    /// <param name="distId">The distribution ID.</param>
    /// <param name="query">Query parameters for filtering and pagination.</param>
    /// <returns>List of recipients.</returns>
    [HttpGet("{distId:guid}/recipients")]
    [ProducesResponseType(typeof(IReadOnlyList<EmailRecipientDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetDistributionRecipients(
        Guid surveyId,
        Guid distId,
        [FromQuery] GetDistributionRecipientsQuery query
    )
    {
        var result = await _mediator.Send(
            query with
            {
                SurveyId = surveyId,
                DistributionId = distId,
            }
        );
        return HandleResult(result);
    }
}
