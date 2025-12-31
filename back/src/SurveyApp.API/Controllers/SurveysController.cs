using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OutputCaching;
using Microsoft.Extensions.Localization;
using SurveyApp.API.Extensions;
using SurveyApp.Application.DTOs;
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
public class SurveysController(IMediator mediator, IStringLocalizer<SurveysController> localizer)
    : ControllerBase
{
    private readonly IMediator _mediator = mediator;
    private readonly IStringLocalizer<SurveysController> _localizer = localizer;

    /// <summary>
    /// Get all surveys in the current namespace
    /// </summary>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSurveys(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] SurveyStatus? status = null,
        [FromQuery] string? searchTerm = null,
        [FromQuery] string? sortBy = null,
        [FromQuery] bool sortDescending = true
    )
    {
        var result = await _mediator.Send(
            new GetSurveysQuery
            {
                PageNumber = pageNumber,
                PageSize = pageSize,
                Status = status,
                SearchTerm = searchTerm,
                SortBy = sortBy,
                SortDescending = sortDescending,
            }
        );

        if (!result.IsSuccess)
            return result.ToProblemDetails(HttpContext);

        return Ok(result.Value);
    }

    /// <summary>
    /// Get a survey by ID
    /// </summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _mediator.Send(new GetSurveyByIdQuery { SurveyId = id });

        if (!result.IsSuccess)
            return result.ToProblemDetails(HttpContext);

        return Ok(result.Value);
    }

    /// <summary>
    /// Get a public survey by share token (no auth required)
    /// </summary>
    [HttpGet("public/{shareToken}")]
    [AllowAnonymous]
    [OutputCache(PolicyName = "PublicSurvey")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetPublicSurvey(string shareToken)
    {
        var result = await _mediator.Send(new GetPublicSurveyQuery { ShareToken = shareToken });

        if (!result.IsSuccess)
            return result.ToProblemDetails(HttpContext);

        return Ok(result.Value);
    }

    /// <summary>
    /// Create a new survey
    /// </summary>
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] CreateSurveyCommand command)
    {
        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
            return result.ToProblemDetails(HttpContext);

        return CreatedAtAction(nameof(GetById), new { id = result.Value!.Id }, result.Value);
    }

    /// <summary>
    /// Update a survey
    /// </summary>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateSurveyCommand command)
    {
        if (id != command.SurveyId)
            return BadRequest(
                new ProblemDetails
                {
                    Type = "https://tools.ietf.org/html/rfc7231#section-6.5.1",
                    Title = _localizer["Errors.BadRequest"],
                    Status = StatusCodes.Status400BadRequest,
                    Detail = _localizer["Errors.IdMismatchUrlBody"],
                    Instance = HttpContext.Request.Path,
                }
            );

        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
            return result.ToProblemDetails(HttpContext);

        return Ok(result.Value);
    }

    /// <summary>
    /// Publish a survey
    /// </summary>
    [HttpPost("{id:guid}/publish")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Publish(Guid id)
    {
        var result = await _mediator.Send(new PublishSurveyCommand { SurveyId = id });

        if (!result.IsSuccess)
            return result.ToProblemDetails(HttpContext);

        return Ok(result.Value);
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
        [FromBody] DuplicateSurveyRequest? request = null
    )
    {
        var result = await _mediator.Send(
            new DuplicateSurveyCommand { SurveyId = id, NewTitle = request?.NewTitle }
        );

        if (!result.IsSuccess)
            return result.ToProblemDetails(HttpContext);

        return CreatedAtAction(nameof(GetById), new { id = result.Value!.Id }, result.Value);
    }

    /// <summary>
    /// Close a survey
    /// </summary>
    [HttpPost("{id:guid}/close")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Close(Guid id)
    {
        var result = await _mediator.Send(new CloseSurveyCommand { SurveyId = id });

        if (!result.IsSuccess)
            return result.ToProblemDetails(HttpContext);

        return Ok(result.Value);
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
        var result = await _mediator.Send(new DeleteSurveyCommand { SurveyId = id });

        if (!result.IsSuccess)
            return result.ToProblemDetails(HttpContext);

        return NoContent();
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
        var result = await _mediator.Send(new GetSurveyAnalyticsQuery { SurveyId = id });

        if (!result.IsSuccess)
            return result.ToProblemDetails(HttpContext);

        return Ok(result.Value);
    }

    /// <summary>
    /// Export survey responses
    /// </summary>
    /// <param name="id">The survey ID.</param>
    /// <param name="request">Export request parameters.</param>
    /// <returns>File download with exported data.</returns>
    [HttpPost("{id:guid}/export")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ExportResponses(Guid id, [FromBody] ExportRequestDto request)
    {
        var command = new ExportResponsesCommand
        {
            SurveyId = id,
            Format = request.Format,
            Filter = request.Filter,
            QuestionIds = request.QuestionIds,
            IncludeMetadata = request.IncludeMetadata,
            IncludeIncomplete = request.IncludeIncomplete,
            TimezoneId = request.TimezoneId,
        };

        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
            return result.ToProblemDetails(HttpContext);

        return File(result.Value!.Data, result.Value.ContentType, result.Value.FileName);
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
        var result = await _mediator.Send(new GetExportPreviewQuery { SurveyId = id });

        if (!result.IsSuccess)
            return result.ToProblemDetails(HttpContext);

        return Ok(result.Value);
    }

    /// <summary>
    /// Apply a theme to a survey
    /// </summary>
    /// <param name="id">The survey ID.</param>
    /// <param name="request">The theme ID to apply (null to remove theme).</param>
    [HttpPut("{id:guid}/theme")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ApplyTheme(Guid id, [FromBody] ApplySurveyThemeRequest request)
    {
        var result = await _mediator.Send(
            new ApplyThemeToSurveyCommand
            {
                SurveyId = id,
                ThemeId = request.ThemeId,
                PresetThemeId = request.PresetThemeId,
                ThemeCustomizations = request.ThemeCustomizations,
            }
        );

        if (!result.IsSuccess)
            return result.ToProblemDetails(HttpContext);

        return Ok(result.Value);
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
        var result = await _mediator.Send(new GetSurveyNpsQuery { SurveyId = id });

        if (!result.IsSuccess)
            return result.ToProblemDetails(HttpContext);

        return Ok(result.Value);
    }

    /// <summary>
    /// Get NPS trend over time for a survey
    /// </summary>
    /// <param name="id">The survey ID.</param>
    /// <param name="request">Trend request parameters.</param>
    /// <returns>NPS trend data with data points over time.</returns>
    [HttpGet("{id:guid}/nps/trend")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetNpsTrend(Guid id, [FromQuery] NpsTrendRequest request)
    {
        var result = await _mediator.Send(
            new GetNpsTrendQuery
            {
                SurveyId = id,
                FromDate = request.FromDate ?? DateTime.UtcNow.AddMonths(-3),
                ToDate = request.ToDate ?? DateTime.UtcNow,
                GroupBy = request.GroupBy ?? NpsTrendGroupBy.Week,
            }
        );

        if (!result.IsSuccess)
            return result.ToProblemDetails(HttpContext);

        return Ok(result.Value);
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
        var result = await _mediator.Send(
            new GetQuestionNpsQuery { SurveyId = id, QuestionId = questionId }
        );

        if (!result.IsSuccess)
            return result.ToProblemDetails(HttpContext);

        return Ok(result.Value);
    }
}

/// <summary>
/// Request body for applying theme to a survey.
/// </summary>
public class ApplySurveyThemeRequest
{
    /// <summary>
    /// The saved theme ID (Guid) to apply custom themes.
    /// </summary>
    public Guid? ThemeId { get; set; }

    /// <summary>
    /// The preset theme identifier (e.g., "midnight", "ocean") to apply preset themes.
    /// </summary>
    public string? PresetThemeId { get; set; }

    /// <summary>
    /// Optional JSON string containing theme customizations.
    /// </summary>
    public string? ThemeCustomizations { get; set; }
}

/// <summary>
/// Request body for exporting survey responses.
/// </summary>
public class ExportRequestDto
{
    /// <summary>
    /// The export format (Csv, Excel, Json).
    /// </summary>
    public Application.DTOs.ExportFormat Format { get; set; }

    /// <summary>
    /// Optional filter for the export.
    /// </summary>
    public ExportFilter? Filter { get; set; }

    /// <summary>
    /// Specific question IDs to include (null = all questions).
    /// </summary>
    public List<Guid>? QuestionIds { get; set; }

    /// <summary>
    /// Whether to include metadata (IP, UserAgent, etc.).
    /// </summary>
    public bool IncludeMetadata { get; set; }

    /// <summary>
    /// Whether to include incomplete responses.
    /// </summary>
    public bool IncludeIncomplete { get; set; }

    /// <summary>
    /// Timezone ID for date formatting.
    /// </summary>
    public string? TimezoneId { get; set; }
}

/// <summary>
/// Request parameters for NPS trend query.
/// </summary>
public class NpsTrendRequest
{
    /// <summary>
    /// Start date for the trend analysis. Defaults to 3 months ago.
    /// </summary>
    public DateTime? FromDate { get; set; }

    /// <summary>
    /// End date for the trend analysis. Defaults to current date.
    /// </summary>
    public DateTime? ToDate { get; set; }

    /// <summary>
    /// How to group the trend data (Day, Week, Month). Defaults to Week.
    /// </summary>
    public NpsTrendGroupBy? GroupBy { get; set; }
}

/// <summary>
/// Request parameters for duplicating a survey.
/// </summary>
public class DuplicateSurveyRequest
{
    /// <summary>
    /// Optional new title for the duplicated survey.
    /// If not provided, will append "(Copy)" to the original title.
    /// </summary>
    public string? NewTitle { get; set; }
}
