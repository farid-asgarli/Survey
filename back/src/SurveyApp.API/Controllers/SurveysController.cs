using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OutputCaching;
using SurveyApp.Application.DTOs;
using SurveyApp.Application.DTOs.Common;
using SurveyApp.Application.Features.Nps.Queries.GetNpsTrend;
using SurveyApp.Application.Features.Nps.Queries.GetQuestionNps;
using SurveyApp.Application.Features.Nps.Queries.GetSurveyNps;
using SurveyApp.Application.Features.Responses.Commands;
using SurveyApp.Application.Features.Responses.Queries;
using SurveyApp.Application.Features.Surveys.Commands.CloseSurvey;
using SurveyApp.Application.Features.Surveys.Commands.CreateSurvey;
using SurveyApp.Application.Features.Surveys.Commands.DeleteSurvey;
using SurveyApp.Application.Features.Surveys.Commands.DuplicateSurvey;
using SurveyApp.Application.Features.Surveys.Commands.PublishSurvey;
using SurveyApp.Application.Features.Surveys.Commands.UpdateSurvey;
using SurveyApp.Application.Features.Surveys.Queries.GetPublicSurvey;
using SurveyApp.Application.Features.Surveys.Queries.GetSurveyAnalytics;
using SurveyApp.Application.Features.Surveys.Queries.GetSurveyById;
using SurveyApp.Application.Features.Surveys.Queries.GetSurveys;
using SurveyApp.Application.Features.Themes.Commands.ApplyThemeToSurvey;
using SurveyApp.Application.Services;
using SurveyApp.Domain.Enums;

namespace SurveyApp.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SurveysController(IMediator mediator) : ApiControllerBase
{
    private readonly IMediator _mediator = mediator;

    /// <summary>
    /// Get all surveys in the current namespace
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(PagedResponse<SurveyListItemDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSurveys([FromQuery] GetSurveysQuery query)
    {
        var result = await _mediator.Send(query);
        return HandleResult(result);
    }

    /// <summary>
    /// Get a survey by ID
    /// </summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(SurveyDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _mediator.Send(new GetSurveyByIdQuery(id));
        return HandleResult(result);
    }

    /// <summary>
    /// Get a public survey by share token (no auth required)
    /// </summary>
    [HttpGet("public/{shareToken}")]
    [AllowAnonymous]
    [OutputCache(PolicyName = "PublicSurvey")]
    [ProducesResponseType(typeof(PublicSurveyDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetPublicSurvey(string shareToken)
    {
        var result = await _mediator.Send(new GetPublicSurveyQuery(shareToken));
        return HandleResult(result);
    }

    /// <summary>
    /// Create a new survey
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(SurveyDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] CreateSurveyCommand command)
    {
        var result = await _mediator.Send(command);
        return HandleCreatedResult(result, nameof(GetById), v => new { id = v.Id });
    }

    /// <summary>
    /// Update a survey
    /// </summary>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(SurveyDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateSurveyCommand command)
    {
        if (ValidateIdMatch(id, command.SurveyId) is { } mismatchResult)
            return mismatchResult;

        var result = await _mediator.Send(command);
        return HandleResult(result);
    }

    /// <summary>
    /// Publish a survey
    /// </summary>
    [HttpPost("{id:guid}/publish")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Publish(Guid id)
    {
        var result = await _mediator.Send(new PublishSurveyCommand(id));
        return HandleResult(result);
    }

    /// <summary>
    /// Duplicate a survey (create a copy as draft)
    /// </summary>
    [HttpPost("{id:guid}/duplicate")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Duplicate(
        Guid id,
        [FromBody] DuplicateSurveyCommand? command = null
    )
    {
        var result = await _mediator.Send(
            (command ?? new DuplicateSurveyCommand()) with
            {
                SurveyId = id,
            }
        );
        return HandleCreatedResult(result, nameof(GetById), v => new { id = v.Id });
    }

    /// <summary>
    /// Close a survey
    /// </summary>
    [HttpPost("{id:guid}/close")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Close(Guid id)
    {
        var result = await _mediator.Send(new CloseSurveyCommand(id));
        return HandleResult(result);
    }

    /// <summary>
    /// Delete a survey
    /// </summary>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id)
    {
        var result = await _mediator.Send(new DeleteSurveyCommand(id));
        return HandleNoContentResult(result);
    }

    /// <summary>
    /// Get survey analytics
    /// </summary>
    [HttpGet("{id:guid}/analytics")]
    [OutputCache(PolicyName = "Analytics")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetAnalytics(Guid id)
    {
        var result = await _mediator.Send(new GetSurveyAnalyticsQuery(id));
        return HandleResult(result);
    }

    /// <summary>
    /// Export survey responses
    /// </summary>
    /// <param name="id">The survey ID.</param>
    /// <param name="command">Export command parameters.</param>
    /// <returns>File download with exported data.</returns>
    [HttpPost("{id:guid}/export")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ExportResponses(
        Guid id,
        [FromBody] ExportResponsesCommand command
    )
    {
        var result = await _mediator.Send(command with { SurveyId = id });
        return HandleFileResult(result, v => v.Data, v => v.ContentType, v => v.FileName);
    }

    /// <summary>
    /// Get export preview information
    /// </summary>
    /// <param name="id">The survey ID.</param>
    /// <returns>Export preview with available columns and statistics.</returns>
    [HttpGet("{id:guid}/export/preview")]
    [OutputCache(PolicyName = "ExportPreview")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetExportPreview(Guid id)
    {
        var result = await _mediator.Send(new GetExportPreviewQuery(id));
        return HandleResult(result);
    }

    /// <summary>
    /// Apply a theme to a survey
    /// </summary>
    /// <param name="id">The survey ID.</param>
    /// <param name="command">The theme command (null ThemeId to remove theme).</param>
    [HttpPut("{id:guid}/theme")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ApplyTheme(
        Guid id,
        [FromBody] ApplyThemeToSurveyCommand command
    )
    {
        var result = await _mediator.Send(command with { SurveyId = id });
        return HandleResult(result);
    }

    /// <summary>
    /// Get NPS (Net Promoter Score) for a survey
    /// </summary>
    /// <param name="id">The survey ID.</param>
    /// <returns>NPS summary including scores for all NPS questions.</returns>
    [HttpGet("{id:guid}/nps")]
    [OutputCache(PolicyName = "Nps")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetNps(Guid id)
    {
        var result = await _mediator.Send(new GetSurveyNpsQuery(id));
        return HandleResult(result);
    }

    /// <summary>
    /// Get NPS trend over time for a survey
    /// </summary>
    /// <param name="id">The survey ID.</param>
    /// <param name="fromDate">Start date for the trend analysis. Defaults to 3 months ago.</param>
    /// <param name="toDate">End date for the trend analysis. Defaults to current date.</param>
    /// <param name="groupBy">How to group the trend data (Day, Week, Month). Defaults to Week.</param>
    /// <returns>NPS trend data with data points over time.</returns>
    [HttpGet("{id:guid}/nps/trend")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetNpsTrend(
        Guid id,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null,
        [FromQuery] NpsTrendGroupBy? groupBy = null
    )
    {
        var result = await _mediator.Send(
            new GetNpsTrendQuery
            {
                SurveyId = id,
                FromDate = fromDate ?? DateTime.UtcNow.AddMonths(-3),
                ToDate = toDate ?? DateTime.UtcNow,
                GroupBy = groupBy ?? NpsTrendGroupBy.Week,
            }
        );
        return HandleResult(result);
    }

    /// <summary>
    /// Get NPS for a specific question in a survey
    /// </summary>
    /// <param name="id">The survey ID.</param>
    /// <param name="questionId">The question ID.</param>
    /// <returns>NPS score for the specific question.</returns>
    [HttpGet("{id:guid}/questions/{questionId:guid}/nps")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetQuestionNps(Guid id, Guid questionId)
    {
        var result = await _mediator.Send(new GetQuestionNpsQuery(id, questionId));
        return HandleResult(result);
    }
}
