using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SurveyApp.API.Extensions;
using SurveyApp.Application.DTOs;
using SurveyApp.Application.Features.SurveyLinks.Commands.CreateSurveyLink;
using SurveyApp.Application.Features.SurveyLinks.Commands.DeactivateSurveyLink;
using SurveyApp.Application.Features.SurveyLinks.Commands.GenerateBulkLinks;
using SurveyApp.Application.Features.SurveyLinks.Commands.RecordLinkClick;
using SurveyApp.Application.Features.SurveyLinks.Commands.UpdateSurveyLink;
using SurveyApp.Application.Features.SurveyLinks.Queries.GetLinkAnalytics;
using SurveyApp.Application.Features.SurveyLinks.Queries.GetLinkByToken;
using SurveyApp.Application.Features.SurveyLinks.Queries.GetSurveyLinkById;
using SurveyApp.Application.Features.SurveyLinks.Queries.GetSurveyLinks;

namespace SurveyApp.API.Controllers;

/// <summary>
/// Controller for managing survey links with tracking capabilities.
/// </summary>
[ApiController]
[Route("api/surveys/{surveyId:guid}/links")]
[Authorize]
public class SurveyLinksController(IMediator mediator) : ApiControllerBase
{
    private readonly IMediator _mediator = mediator;

    /// <summary>
    /// Get all links for a survey.
    /// </summary>
    /// <param name="surveyId">The survey ID.</param>
    /// <param name="isActive">Optional filter by active status.</param>
    /// <returns>List of survey links.</returns>
    [HttpGet]
    [ProducesResponseType(typeof(List<SurveyLinkDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetSurveyLinks(
        Guid surveyId,
        [FromQuery] bool? isActive = null
    )
    {
        var result = await _mediator.Send(
            new GetSurveyLinksQuery { SurveyId = surveyId, IsActive = isActive }
        );

        if (!result.IsSuccess)
            return result.ToProblemDetails(HttpContext);

        return Ok(result.Value);
    }

    /// <summary>
    /// Get a survey link by ID.
    /// </summary>
    /// <param name="surveyId">The survey ID.</param>
    /// <param name="linkId">The link ID.</param>
    /// <returns>Survey link details.</returns>
    [HttpGet("{linkId:guid}")]
    [ProducesResponseType(typeof(SurveyLinkDetailsDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetSurveyLinkById(Guid surveyId, Guid linkId)
    {
        var result = await _mediator.Send(
            new GetSurveyLinkByIdQuery { SurveyId = surveyId, LinkId = linkId }
        );

        if (!result.IsSuccess)
            return result.ToProblemDetails(HttpContext);

        return Ok(result.Value);
    }

    /// <summary>
    /// Create a new survey link.
    /// </summary>
    /// <param name="surveyId">The survey ID.</param>
    /// <param name="dto">The link creation data.</param>
    /// <returns>The created survey link.</returns>
    [HttpPost]
    [ProducesResponseType(typeof(SurveyLinkDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateSurveyLink(
        Guid surveyId,
        [FromBody] CreateSurveyLinkDto dto
    )
    {
        var result = await _mediator.Send(
            new CreateSurveyLinkCommand
            {
                SurveyId = surveyId,
                Type = dto.Type,
                Name = dto.Name,
                Source = dto.Source,
                Medium = dto.Medium,
                Campaign = dto.Campaign,
                PrefillData = dto.PrefillData,
                ExpiresAt = dto.ExpiresAt,
                MaxUses = dto.MaxUses,
                Password = dto.Password,
            }
        );

        if (!result.IsSuccess)
            return result.ToProblemDetails(HttpContext);

        return CreatedAtAction(
            nameof(GetSurveyLinkById),
            new { surveyId, linkId = result.Value!.Id },
            result.Value
        );
    }

    /// <summary>
    /// Update a survey link.
    /// </summary>
    /// <param name="surveyId">The survey ID.</param>
    /// <param name="linkId">The link ID.</param>
    /// <param name="dto">The link update data.</param>
    /// <returns>The updated survey link.</returns>
    [HttpPut("{linkId:guid}")]
    [ProducesResponseType(typeof(SurveyLinkDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateSurveyLink(
        Guid surveyId,
        Guid linkId,
        [FromBody] UpdateSurveyLinkDto dto
    )
    {
        var result = await _mediator.Send(
            new UpdateSurveyLinkCommand
            {
                SurveyId = surveyId,
                LinkId = linkId,
                Name = dto.Name,
                Source = dto.Source,
                Medium = dto.Medium,
                Campaign = dto.Campaign,
                PrefillData = dto.PrefillData,
                ExpiresAt = dto.ExpiresAt,
                MaxUses = dto.MaxUses,
                Password = dto.Password,
                IsActive = dto.IsActive,
            }
        );

        if (!result.IsSuccess)
            return result.ToProblemDetails(HttpContext);

        return Ok(result.Value);
    }

    /// <summary>
    /// Deactivate a survey link.
    /// </summary>
    /// <param name="surveyId">The survey ID.</param>
    /// <param name="linkId">The link ID.</param>
    /// <returns>Success status.</returns>
    [HttpDelete("{linkId:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeactivateSurveyLink(Guid surveyId, Guid linkId)
    {
        var result = await _mediator.Send(
            new DeactivateSurveyLinkCommand { SurveyId = surveyId, LinkId = linkId }
        );

        if (!result.IsSuccess)
            return result.ToProblemDetails(HttpContext);

        return NoContent();
    }

    /// <summary>
    /// Get analytics for a survey link.
    /// </summary>
    /// <param name="surveyId">The survey ID.</param>
    /// <param name="linkId">The link ID.</param>
    /// <param name="startDate">Optional start date for analytics.</param>
    /// <param name="endDate">Optional end date for analytics.</param>
    /// <returns>Link analytics data.</returns>
    [HttpGet("{linkId:guid}/analytics")]
    [ProducesResponseType(typeof(LinkAnalyticsDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetLinkAnalytics(
        Guid surveyId,
        Guid linkId,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null
    )
    {
        var result = await _mediator.Send(
            new GetLinkAnalyticsQuery
            {
                SurveyId = surveyId,
                LinkId = linkId,
                StartDate = startDate,
                EndDate = endDate,
            }
        );

        if (!result.IsSuccess)
            return result.ToProblemDetails(HttpContext);

        return Ok(result.Value);
    }

    /// <summary>
    /// Generate multiple unique links at once.
    /// </summary>
    /// <param name="surveyId">The survey ID.</param>
    /// <param name="dto">The bulk generation data.</param>
    /// <returns>The generated links.</returns>
    [HttpPost("bulk")]
    [ProducesResponseType(typeof(BulkLinkGenerationResultDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GenerateBulkLinks(
        Guid surveyId,
        [FromBody] BulkLinkGenerationDto dto
    )
    {
        var result = await _mediator.Send(
            new GenerateBulkLinksCommand
            {
                SurveyId = surveyId,
                Count = dto.Count,
                NamePrefix = dto.NamePrefix,
                Source = dto.Source,
                Medium = dto.Medium,
                Campaign = dto.Campaign,
                ExpiresAt = dto.ExpiresAt,
            }
        );

        if (!result.IsSuccess)
            return result.ToProblemDetails(HttpContext);

        return Created("", result.Value);
    }
}

/// <summary>
/// Controller for public survey link access (short links).
/// </summary>
[ApiController]
[Route("api/s")]
public class ShortLinksController(IMediator mediator) : ControllerBase
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
        var result = await _mediator.Send(new GetLinkByTokenQuery { Token = token });

        if (!result.IsSuccess)
            return result.ToProblemDetails(HttpContext);

        return Ok(result.Value);
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

        if (!result.IsSuccess)
            return result.ToProblemDetails(HttpContext);

        return Ok(result.Value);
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
