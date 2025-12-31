using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using SurveyApp.API.Extensions;
using SurveyApp.Application.DTOs;
using SurveyApp.Application.Features.EmailDistributions.Commands.CancelDistribution;
using SurveyApp.Application.Features.EmailDistributions.Commands.CreateDistribution;
using SurveyApp.Application.Features.EmailDistributions.Commands.DeleteDistribution;
using SurveyApp.Application.Features.EmailDistributions.Commands.ScheduleDistribution;
using SurveyApp.Application.Features.EmailDistributions.Commands.SendDistribution;
using SurveyApp.Application.Features.EmailDistributions.Commands.TrackClick;
using SurveyApp.Application.Features.EmailDistributions.Commands.TrackOpen;
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
public class EmailDistributionsController(IMediator mediator) : ControllerBase
{
    private readonly IMediator _mediator = mediator;

    /// <summary>
    /// Gets all distributions for a survey.
    /// </summary>
    /// <param name="surveyId">The survey ID.</param>
    /// <param name="pageNumber">Page number (default: 1).</param>
    /// <param name="pageSize">Page size (default: 20).</param>
    /// <returns>List of distributions.</returns>
    [HttpGet]
    [ProducesResponseType(
        typeof(IReadOnlyList<EmailDistributionSummaryDto>),
        StatusCodes.Status200OK
    )]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetDistributions(
        Guid surveyId,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 20
    )
    {
        var query = new GetDistributionsQuery
        {
            SurveyId = surveyId,
            PageNumber = pageNumber,
            PageSize = pageSize,
        };

        var result = await _mediator.Send(query);

        if (!result.IsSuccess)
            return result.ToProblemDetails(HttpContext);

        return Ok(result.Value);
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

        if (!result.IsSuccess)
            return result.ToProblemDetails(HttpContext);

        return Ok(result.Value);
    }

    /// <summary>
    /// Creates a new email distribution.
    /// </summary>
    /// <param name="surveyId">The survey ID.</param>
    /// <param name="request">The distribution data.</param>
    /// <returns>The created distribution.</returns>
    [HttpPost]
    [ProducesResponseType(typeof(EmailDistributionDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateDistribution(
        Guid surveyId,
        [FromBody] CreateEmailDistributionDto request
    )
    {
        var command = new CreateDistributionCommand
        {
            SurveyId = surveyId,
            EmailTemplateId = request.EmailTemplateId,
            Subject = request.Subject,
            Body = request.Body,
            SenderName = request.SenderName,
            SenderEmail = request.SenderEmail,
            Recipients = request.Recipients,
        };

        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
            return result.ToProblemDetails(HttpContext);

        return CreatedAtAction(
            nameof(GetDistributionById),
            new { surveyId, distId = result.Value!.Id },
            result.Value
        );
    }

    /// <summary>
    /// Schedules a distribution to be sent at a specific time.
    /// </summary>
    /// <param name="surveyId">The survey ID.</param>
    /// <param name="distId">The distribution ID.</param>
    /// <param name="request">The schedule data.</param>
    /// <returns>The updated distribution.</returns>
    [HttpPost("{distId:guid}/schedule")]
    [ProducesResponseType(typeof(EmailDistributionDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ScheduleDistribution(
        Guid surveyId,
        Guid distId,
        [FromBody] ScheduleDistributionDto request
    )
    {
        var command = new ScheduleDistributionCommand
        {
            SurveyId = surveyId,
            DistributionId = distId,
            ScheduledAt = request.ScheduledAt,
        };

        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
            return result.ToProblemDetails(HttpContext);

        return Ok(result.Value);
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

        if (!result.IsSuccess)
            return result.ToProblemDetails(HttpContext);

        return Ok(result.Value);
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

        if (!result.IsSuccess)
            return result.ToProblemDetails(HttpContext);

        return NoContent();
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

        if (!result.IsSuccess)
            return result.ToProblemDetails(HttpContext);

        return NoContent();
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

        if (!result.IsSuccess)
            return result.ToProblemDetails(HttpContext);

        return Ok(result.Value);
    }

    /// <summary>
    /// Gets recipients for a distribution.
    /// </summary>
    /// <param name="surveyId">The survey ID.</param>
    /// <param name="distId">The distribution ID.</param>
    /// <param name="pageNumber">Page number (default: 1).</param>
    /// <param name="pageSize">Page size (default: 50).</param>
    /// <param name="status">Optional filter by recipient status.</param>
    /// <returns>List of recipients.</returns>
    [HttpGet("{distId:guid}/recipients")]
    [ProducesResponseType(typeof(IReadOnlyList<EmailRecipientDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetDistributionRecipients(
        Guid surveyId,
        Guid distId,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 50,
        [FromQuery] RecipientStatus? status = null
    )
    {
        var query = new GetDistributionRecipientsQuery
        {
            SurveyId = surveyId,
            DistributionId = distId,
            PageNumber = pageNumber,
            PageSize = pageSize,
            Status = status,
        };

        var result = await _mediator.Send(query);

        if (!result.IsSuccess)
            return result.ToProblemDetails(HttpContext);

        return Ok(result.Value);
    }
}

/// <summary>
/// Controller for email tracking endpoints.
/// Rate limited to prevent abuse such as token enumeration, metric inflation, and DoS attacks.
/// </summary>
[ApiController]
[Route("api/track")]
[EnableRateLimiting("tracking")]
public class EmailTrackingController(IMediator mediator) : ControllerBase
{
    private readonly IMediator _mediator = mediator;

    /// <summary>
    /// Tracks an email open event (1x1 pixel).
    /// </summary>
    /// <param name="token">The tracking token.</param>
    /// <returns>A 1x1 transparent pixel.</returns>
    [HttpGet("open/{token}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
    public async Task<IActionResult> TrackOpen(string token)
    {
        await _mediator.Send(new TrackOpenCommand(token));

        // Return a 1x1 transparent GIF
        var transparentPixel = Convert.FromBase64String(
            "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
        );

        return File(transparentPixel, "image/gif");
    }

    /// <summary>
    /// Tracks a link click event and redirects to the survey.
    /// </summary>
    /// <param name="token">The tracking token.</param>
    /// <returns>Redirect to the survey.</returns>
    [HttpGet("click/{token}")]
    [ProducesResponseType(StatusCodes.Status302Found)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
    public async Task<IActionResult> TrackClick(string token)
    {
        var result = await _mediator.Send(new TrackClickCommand(token));

        if (!result.IsSuccess)
            return result.ToProblemDetails(HttpContext);

        // Redirect to the public survey URL
        var surveyUrl = $"/survey/{result.Value}";
        return Redirect(surveyUrl);
    }
}
