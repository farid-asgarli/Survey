using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SurveyApp.Application.Features.SurveyLinks.Commands.RecordLinkClick;
using SurveyApp.Application.Features.SurveyLinks.Queries.GetLinkByToken;

namespace SurveyApp.API.Controllers;

/// <summary>
/// Controller for public survey link access (short links).
/// </summary>
[ApiController]
[Route("api/s")]
public class ShortLinksController(IMediator mediator) : ApiControllerBase
{
    private readonly IMediator _mediator = mediator;

    /// <summary>
    /// Get link information by token (for pre-validation).
    /// </summary>
    /// <param name="token">The link token.</param>
    /// <returns>Link information.</returns>
    [HttpGet("{token}")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(LinkByTokenResult), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetLinkByToken(string token)
    {
        var result = await _mediator.Send(new GetLinkByTokenQuery(token));
        return HandleResult(result);
    }

    /// <summary>
    /// Access a survey via short link (records click and redirects).
    /// </summary>
    /// <param name="token">The link token.</param>
    /// <param name="password">Optional password for protected links.</param>
    /// <returns>Survey access information.</returns>
    [HttpPost("{token}/access")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(RecordLinkClickResult), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> AccessLink(
        string token,
        [FromBody] LinkAccessRequest? request = null
    )
    {
        var ipAddress = GetClientIpAddress();
        var userAgent = Request.Headers.UserAgent.ToString();
        var referrer = Request.Headers.Referer.ToString();

        var result = await _mediator.Send(
            new RecordLinkClickCommand
            {
                Token = token,
                IpAddress = ipAddress,
                UserAgent = userAgent,
                Referrer = referrer,
                Password = request?.Password,
            }
        );

        return HandleResult(result);
    }

    private string? GetClientIpAddress()
    {
        // Try to get from X-Forwarded-For header first (for proxies/load balancers)
        var forwardedFor = Request.Headers["X-Forwarded-For"].FirstOrDefault();
        if (!string.IsNullOrEmpty(forwardedFor))
        {
            return forwardedFor.Split(',').First().Trim();
        }

        // Fall back to remote IP
        return HttpContext.Connection.RemoteIpAddress?.ToString();
    }
}

/// <summary>
/// Request for accessing a protected link.
/// </summary>
public class LinkAccessRequest
{
    /// <summary>
    /// Password for protected links.
    /// </summary>
    public string? Password { get; set; }
}
