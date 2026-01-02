using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SurveyApp.Application.DTOs;
using SurveyApp.Application.DTOs.Common;
using SurveyApp.Application.Features.SurveyLinks.Commands.CreateSurveyLink;
using SurveyApp.Application.Features.SurveyLinks.Commands.DeactivateSurveyLink;
using SurveyApp.Application.Features.SurveyLinks.Commands.GenerateBulkLinks;
using SurveyApp.Application.Features.SurveyLinks.Commands.UpdateSurveyLink;
using SurveyApp.Application.Features.SurveyLinks.Queries.GetLinkAnalytics;
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
    /// Get all links for a survey with pagination.
    /// </summary>
    /// <param name="surveyId">The survey ID.</param>
    /// <param name="query">Query parameters for filtering and pagination.</param>
    /// <returns>Paginated list of survey links.</returns>
    [HttpGet]
    [ProducesResponseType(typeof(PagedResponse<SurveyLinkDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetSurveyLinks(
        Guid surveyId,
        [FromQuery] GetSurveyLinksQuery query
    )
    {
        var result = await _mediator.Send(query with { SurveyId = surveyId });

        return HandleResult(result);
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
        var result = await _mediator.Send(new GetSurveyLinkByIdQuery(surveyId, linkId));

        return HandleResult(result);
    }

    /// <summary>
    /// Create a new survey link.
    /// </summary>
    /// <param name="surveyId">The survey ID.</param>
    /// <param name="command">The link creation command.</param>
    /// <returns>The created survey link.</returns>
    [HttpPost]
    [ProducesResponseType(typeof(SurveyLinkDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateSurveyLink(
        Guid surveyId,
        [FromBody] CreateSurveyLinkCommand command
    )
    {
        var result = await _mediator.Send(command with { SurveyId = surveyId });

        return HandleCreatedResult(
            result,
            nameof(GetSurveyLinkById),
            v => new { surveyId, linkId = v.Id }
        );
    }

    /// <summary>
    /// Update a survey link.
    /// </summary>
    /// <param name="surveyId">The survey ID.</param>
    /// <param name="linkId">The link ID.</param>
    /// <param name="command">The link update command.</param>
    /// <returns>The updated survey link.</returns>
    [HttpPut("{linkId:guid}")]
    [ProducesResponseType(typeof(SurveyLinkDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateSurveyLink(
        Guid surveyId,
        Guid linkId,
        [FromBody] UpdateSurveyLinkCommand command
    )
    {
        var result = await _mediator.Send(command with { SurveyId = surveyId, LinkId = linkId });

        return HandleResult(result);
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

        return HandleNoContentResult(result);
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

        return HandleResult(result);
    }

    /// <summary>
    /// Generate multiple unique links at once.
    /// </summary>
    /// <param name="surveyId">The survey ID.</param>
    /// <param name="command">The bulk generation command.</param>
    /// <returns>The generated links.</returns>
    [HttpPost("bulk")]
    [ProducesResponseType(typeof(BulkLinkGenerationResultDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GenerateBulkLinks(
        Guid surveyId,
        [FromBody] GenerateBulkLinksCommand command
    )
    {
        var result = await _mediator.Send(command with { SurveyId = surveyId });

        return HandleResult(result);
    }
}
