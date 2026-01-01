using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using SurveyApp.API.Extensions;
using SurveyApp.Application.Features.EmailDistributions.Commands.TrackClick;
using SurveyApp.Application.Features.EmailDistributions.Commands.TrackOpen;

namespace SurveyApp.API.Controllers;

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
