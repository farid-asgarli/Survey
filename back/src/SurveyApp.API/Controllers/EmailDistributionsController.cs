using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Localization;
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
public class EmailDistributionsController(
    IMediator mediator,
    IStringLocalizer<EmailDistributionsController> localizer
) : ControllerBase
{
    private readonly IMediator _mediator = mediator;
    private readonly IStringLocalizer<EmailDistributionsController> _localizer = localizer;

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
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
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
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetDistributionById(Guid surveyId, Guid distId)
    {
        var result = await _mediator.Send(new GetDistributionByIdQuery(distId));

        if (!result.IsSuccess)
            return result.ToProblemDetails(HttpContext);

        // Verify the distribution belongs to the survey
        if (result.Value!.SurveyId != surveyId)
        {
            return NotFound(
                new ProblemDetails
                {
                    Type = "https://tools.ietf.org/html/rfc7231#section-6.5.4",
                    Title = _localizer["Errors.ResourceNotFound"],
                    Status = StatusCodes.Status404NotFound,
                    Detail = _localizer["Errors.DistributionNotFound"],
                    Instance = HttpContext.Request.Path,
                }
            );
        }

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
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
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
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ScheduleDistribution(
        Guid surveyId,
        Guid distId,
        [FromBody] ScheduleDistributionDto request
    )
    {
        var command = new ScheduleDistributionCommand
        {
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
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> SendDistribution(Guid surveyId, Guid distId)
    {
        var result = await _mediator.Send(new SendDistributionCommand(distId));

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
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> CancelDistribution(Guid surveyId, Guid distId)
    {
        var result = await _mediator.Send(new CancelDistributionCommand(distId));

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
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteDistribution(Guid surveyId, Guid distId)
    {
        var result = await _mediator.Send(new DeleteDistributionCommand(distId));

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
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetDistributionStats(Guid surveyId, Guid distId)
    {
        var result = await _mediator.Send(new GetDistributionStatsQuery(distId));

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
    [ProducesResponseType(StatusCodes.Status404NotFound)]
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
/// </summary>
[ApiController]
[Route("api/track")]
public class EmailTrackingController(
    IMediator mediator,
    IStringLocalizer<EmailTrackingController> localizer
) : ControllerBase
{
    private readonly IMediator _mediator = mediator;
    private readonly IStringLocalizer<EmailTrackingController> _localizer = localizer;

    /// <summary>
    /// Tracks an email open event (1x1 pixel).
    /// </summary>
    /// <param name="token">The tracking token.</param>
    /// <returns>A 1x1 transparent pixel.</returns>
    [HttpGet("open/{token}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
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
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> TrackClick(string token)
    {
        var result = await _mediator.Send(new TrackClickCommand(token));

        if (!result.IsSuccess || string.IsNullOrEmpty(result.Value))
        {
            return NotFound(
                new ProblemDetails
                {
                    Type = "https://tools.ietf.org/html/rfc7231#section-6.5.4",
                    Title = _localizer["Errors.ResourceNotFound"],
                    Status = StatusCodes.Status404NotFound,
                    Detail = _localizer["Errors.InvalidTrackingToken"],
                    Instance = HttpContext.Request.Path,
                }
            );
        }

        // Redirect to the public survey URL
        var surveyUrl = $"/survey/{result.Value}";
        return Redirect(surveyUrl);
    }
}
