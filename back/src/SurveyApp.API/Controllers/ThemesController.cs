using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SurveyApp.API.Extensions;
using SurveyApp.Application.DTOs;
using SurveyApp.Application.DTOs.Common;
using SurveyApp.Application.Features.Themes.Commands.ApplyThemeToSurvey;
using SurveyApp.Application.Features.Themes.Commands.CreateTheme;
using SurveyApp.Application.Features.Themes.Commands.DeleteTheme;
using SurveyApp.Application.Features.Themes.Commands.DuplicateTheme;
using SurveyApp.Application.Features.Themes.Commands.SetDefaultTheme;
using SurveyApp.Application.Features.Themes.Commands.UpdateTheme;
using SurveyApp.Application.Features.Themes.Queries.GetPublicThemes;
using SurveyApp.Application.Features.Themes.Queries.GetThemeById;
using SurveyApp.Application.Features.Themes.Queries.GetThemePreview;
using SurveyApp.Application.Features.Themes.Queries.GetThemes;

namespace SurveyApp.API.Controllers;

/// <summary>
/// Controller for managing survey themes and styling.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ThemesController(IMediator mediator) : ApiControllerBase
{
    private readonly IMediator _mediator = mediator;

    /// <summary>
    /// Gets all themes in the current namespace.
    /// </summary>
    /// <param name="query">Query parameters for filtering and pagination.</param>
    /// <returns>Paginated list of themes.</returns>
    [HttpGet]
    [ProducesResponseType(typeof(PagedResponse<SurveyThemeSummaryDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetThemes([FromQuery] GetThemesQuery query)
    {
        var result = await _mediator.Send(query);
        return HandleResult(result);
    }

    /// <summary>
    /// Gets all public themes available to all namespaces.
    /// </summary>
    /// <param name="query">Query parameters for filtering and pagination.</param>
    /// <returns>Paginated list of public themes.</returns>
    [HttpGet("public")]
    [ProducesResponseType(typeof(PagedResponse<SurveyThemeSummaryDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPublicThemes([FromQuery] GetPublicThemesQuery query)
    {
        var result = await _mediator.Send(query);
        return HandleResult(result);
    }

    /// <summary>
    /// Gets a theme by its ID.
    /// </summary>
    /// <param name="id">The theme ID.</param>
    /// <returns>The theme details.</returns>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(SurveyThemeDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetThemeById(Guid id)
    {
        var result = await _mediator.Send(new GetThemeByIdQuery(id));
        return HandleResult(result);
    }

    /// <summary>
    /// Gets a theme preview with generated CSS.
    /// </summary>
    /// <param name="id">The theme ID.</param>
    /// <returns>The theme preview with CSS.</returns>
    [HttpGet("{id:guid}/preview")]
    [ProducesResponseType(typeof(ThemePreviewDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetThemePreview(Guid id)
    {
        var result = await _mediator.Send(new GetThemePreviewQuery(id));
        return HandleResult(result);
    }

    /// <summary>
    /// Gets the generated CSS for a theme.
    /// </summary>
    /// <param name="id">The theme ID.</param>
    /// <returns>The generated CSS as text/css.</returns>
    [HttpGet("{id:guid}/css")]
    [ProducesResponseType(typeof(string), StatusCodes.Status200OK, "text/css")]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetThemeCss(Guid id)
    {
        var result = await _mediator.Send(new GetThemePreviewQuery(id));

        if (!result.IsSuccess || result.Value is null)
            return result.ToProblemDetails(HttpContext);

        return Content(result.Value.GeneratedCss, "text/css");
    }

    /// <summary>
    /// Creates a new theme.
    /// </summary>
    /// <param name="command">The theme creation command.</param>
    /// <returns>The created theme.</returns>
    [HttpPost]
    [ProducesResponseType(typeof(SurveyThemeDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateTheme([FromBody] CreateThemeCommand command)
    {
        var result = await _mediator.Send(command);
        return HandleCreatedResult(result, nameof(GetThemeById), v => new { id = v.Id });
    }

    /// <summary>
    /// Updates an existing theme.
    /// </summary>
    /// <param name="id">The theme ID.</param>
    /// <param name="command">The theme update command.</param>
    /// <returns>The updated theme.</returns>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(SurveyThemeDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateTheme(Guid id, [FromBody] UpdateThemeCommand command)
    {
        if (ValidateIdMatch(id, command.ThemeId) is { } mismatchResult)
            return mismatchResult;

        var result = await _mediator.Send(command);
        return HandleResult(result);
    }

    /// <summary>
    /// Deletes a theme.
    /// </summary>
    /// <param name="id">The theme ID.</param>
    /// <returns>No content.</returns>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteTheme(Guid id)
    {
        var result = await _mediator.Send(new DeleteThemeCommand(id));
        return HandleNoContentResult(result);
    }

    /// <summary>
    /// Duplicates an existing theme.
    /// </summary>
    /// <param name="id">The source theme ID.</param>
    /// <param name="command">The duplicate command with optional new name.</param>
    /// <returns>The new theme.</returns>
    [HttpPost("{id:guid}/duplicate")]
    [ProducesResponseType(typeof(SurveyThemeDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DuplicateTheme(
        Guid id,
        [FromBody] DuplicateThemeCommand? command = null
    )
    {
        var result = await _mediator.Send(
            (command ?? new DuplicateThemeCommand()) with
            {
                ThemeId = id,
            }
        );
        return HandleCreatedResult(result, nameof(GetThemeById), v => new { id = v.Id });
    }

    /// <summary>
    /// Sets a theme as the default for the namespace.
    /// </summary>
    /// <param name="id">The theme ID.</param>
    /// <returns>No content.</returns>
    [HttpPost("{id:guid}/set-default")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> SetDefaultTheme(Guid id)
    {
        var result = await _mediator.Send(new SetDefaultThemeCommand(id));
        return HandleNoContentResult(result);
    }

    /// <summary>
    /// Applies a theme to a survey.
    /// </summary>
    /// <param name="id">The theme ID.</param>
    /// <param name="command">The command containing the survey ID.</param>
    /// <returns>No content.</returns>
    [HttpPost("{id:guid}/apply")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ApplyThemeToSurvey(
        Guid id,
        [FromBody] ApplyThemeToSurveyCommand command
    )
    {
        var result = await _mediator.Send(command with { ThemeId = id });
        return HandleNoContentResult(result);
    }
}
