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
public class EmailTrackingController(IMediator mediator, ILogger<EmailTrackingController> logger)
    : ControllerBase
{
    private readonly IMediator _mediator = mediator;
    private readonly ILogger<EmailTrackingController> _logger = logger;

    /// <summary>
    /// 1x1 transparent GIF pixel for email open tracking.
    /// </summary>
    private static readonly byte[] TransparentPixel = Convert.FromBase64String(
        "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
    );

    /// <summary>
    /// Tracks an email open event (1x1 pixel).
    /// Always returns a pixel to avoid breaking email client display.
    /// </summary>
    /// <param name="token">The tracking token.</param>
    /// <returns>A 1x1 transparent pixel.</returns>
    [HttpGet("open/{token}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
    public async Task<IActionResult> TrackOpen(string token)
    {
        var result = await _mediator.Send(new TrackOpenCommand(token));

        // Log failures but still return pixel to not break email client display
        if (!result.IsSuccess)
        {
            _logger.LogWarning(
                "Failed to track email open for token {Token}: {Error}",
                token,
                result.Error
            );
        }

        // Always return the transparent pixel (email clients expect an image)
        return File(TransparentPixel, "image/gif");
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
        {
            _logger.LogWarning(
                "Failed to track click for token {Token}: {Error}",
                token,
                result.Error
            );
            return result.ToProblemDetails(HttpContext);
        }

        _logger.LogInformation(
            "Click tracked successfully for token {Token}, redirecting to survey",
            token
        );

        // Redirect to the public survey URL (matches frontend route: /s/:shareToken)
        var surveyUrl = $"/s/{result.Value}";
        return Redirect(surveyUrl);
    }
}
