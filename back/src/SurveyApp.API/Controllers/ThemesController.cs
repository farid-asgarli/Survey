using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SurveyApp.API.Extensions;
using SurveyApp.Application.DTOs;
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
    /// <param name="pageNumber">Page number (default: 1).</param>
    /// <param name="pageSize">Page size (default: 20).</param>
    /// <param name="searchTerm">Optional search term.</param>
    /// <returns>List of themes.</returns>
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<SurveyThemeSummaryDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetThemes(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? searchTerm = null
    )
    {
        var query = new GetThemesQuery
        {
            PageNumber = pageNumber,
            PageSize = pageSize,
            SearchTerm = searchTerm,
        };

        var result = await _mediator.Send(query);
        return HandleResult(result);
    }

    /// <summary>
    /// Gets all public themes available to all namespaces.
    /// </summary>
    /// <returns>List of public themes.</returns>
    [HttpGet("public")]
    [ProducesResponseType(typeof(IReadOnlyList<SurveyThemeSummaryDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPublicThemes()
    {
        var result = await _mediator.Send(new GetPublicThemesQuery());
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

        if (!result.IsSuccess)
            return result.ToProblemDetails(HttpContext);

        return Content(result.Value!.GeneratedCss, "text/css");
    }

    /// <summary>
    /// Creates a new theme.
    /// </summary>
    /// <param name="request">The theme creation request.</param>
    /// <returns>The created theme.</returns>
    [HttpPost]
    [ProducesResponseType(typeof(SurveyThemeDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateTheme([FromBody] CreateThemeDto request)
    {
        var command = new CreateThemeCommand
        {
            Name = request.Name,
            Description = request.Description,
            IsPublic = request.IsPublic,
            Colors = request.Colors,
            Typography = request.Typography,
            Layout = request.Layout,
            Branding = request.Branding,
            Button = request.Button,
            CustomCss = request.CustomCss,
        };

        var result = await _mediator.Send(command);
        return HandleCreatedResult(result, nameof(GetThemeById), v => new { id = v.Id });
    }

    /// <summary>
    /// Updates an existing theme.
    /// </summary>
    /// <param name="id">The theme ID.</param>
    /// <param name="request">The theme update request.</param>
    /// <returns>The updated theme.</returns>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(SurveyThemeDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateTheme(Guid id, [FromBody] UpdateThemeDto request)
    {
        var command = new UpdateThemeCommand
        {
            ThemeId = id,
            Name = request.Name,
            Description = request.Description,
            IsPublic = request.IsPublic,
            Colors = request.Colors,
            Typography = request.Typography,
            Layout = request.Layout,
            Branding = request.Branding,
            Button = request.Button,
            CustomCss = request.CustomCss,
        };

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
        var result = await _mediator.Send(new DeleteThemeCommand { ThemeId = id });
        return HandleNoContentResult(result);
    }

    /// <summary>
    /// Duplicates an existing theme.
    /// </summary>
    /// <param name="id">The source theme ID.</param>
    /// <param name="request">The duplicate request with new name.</param>
    /// <returns>The new theme.</returns>
    [HttpPost("{id:guid}/duplicate")]
    [ProducesResponseType(typeof(SurveyThemeDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DuplicateTheme(
        Guid id,
        [FromBody] DuplicateThemeRequest request
    )
    {
        var result = await _mediator.Send(
            new DuplicateThemeCommand { ThemeId = id, NewName = request.NewName }
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
        var result = await _mediator.Send(new SetDefaultThemeCommand { ThemeId = id });
        return HandleNoContentResult(result);
    }

    /// <summary>
    /// Applies a theme to a survey.
    /// </summary>
    /// <param name="id">The theme ID.</param>
    /// <param name="request">The request containing the survey ID.</param>
    /// <returns>No content.</returns>
    [HttpPost("{id:guid}/apply")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ApplyThemeToSurvey(Guid id, [FromBody] ApplyThemeDto request)
    {
        var result = await _mediator.Send(
            new ApplyThemeToSurveyCommand { ThemeId = id, SurveyId = request.SurveyId }
        );
        return HandleNoContentResult(result);
    }
}

#region Request DTOs

/// <summary>
/// Request for duplicating a theme.
/// </summary>
public class DuplicateThemeRequest
{
    public string NewName { get; set; } = null!;
}

#endregion
