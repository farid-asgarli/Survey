using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SurveyApp.API.Extensions;
using SurveyApp.Application.Features.Templates.Commands.CreateSurveyFromTemplate;
using SurveyApp.Application.Features.Templates.Commands.CreateTemplate;
using SurveyApp.Application.Features.Templates.Commands.CreateTemplateFromSurvey;
using SurveyApp.Application.Features.Templates.Commands.DeleteTemplate;
using SurveyApp.Application.Features.Templates.Commands.UpdateTemplate;
using SurveyApp.Application.Features.Templates.Queries.GetTemplateById;
using SurveyApp.Application.Features.Templates.Queries.GetTemplates;

namespace SurveyApp.API.Controllers;

/// <summary>
/// Controller for managing survey templates.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TemplatesController(IMediator mediator) : ApiControllerBase
{
    private readonly IMediator _mediator = mediator;

    /// <summary>
    /// Get all templates in the current namespace
    /// </summary>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetTemplates(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? searchTerm = null,
        [FromQuery] string? category = null,
        [FromQuery] bool? isPublic = null
    )
    {
        var result = await _mediator.Send(
            new GetTemplatesQuery
            {
                PageNumber = pageNumber,
                PageSize = pageSize,
                SearchTerm = searchTerm,
                Category = category,
                IsPublic = isPublic,
            }
        );

        if (!result.IsSuccess)
            return result.ToProblemDetails(HttpContext);

        return Ok(result.Value);
    }

    /// <summary>
    /// Get a template by ID
    /// </summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _mediator.Send(new GetTemplateByIdQuery { TemplateId = id });

        if (!result.IsSuccess)
            return result.ToProblemDetails(HttpContext);

        return Ok(result.Value);
    }

    /// <summary>
    /// Create a new template
    /// </summary>
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] CreateTemplateCommand command)
    {
        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
            return result.ToProblemDetails(HttpContext);

        return CreatedAtAction(nameof(GetById), new { id = result.Value!.Id }, result.Value);
    }

    /// <summary>
    /// Create a template from an existing survey
    /// </summary>
    [HttpPost("from-survey")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateFromSurvey(
        [FromBody] CreateTemplateFromSurveyCommand command
    )
    {
        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
            return result.ToProblemDetails(HttpContext);

        return CreatedAtAction(nameof(GetById), new { id = result.Value!.Id }, result.Value);
    }

    /// <summary>
    /// Create a survey from a template
    /// </summary>
    [HttpPost("{id:guid}/create-survey")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateSurveyFromTemplate(
        Guid id,
        [FromBody] CreateSurveyFromTemplateRequest request
    )
    {
        var command = new CreateSurveyFromTemplateCommand
        {
            TemplateId = id,
            SurveyTitle = request.SurveyTitle,
            Description = request.Description,
        };

        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
            return result.ToProblemDetails(HttpContext);

        return CreatedAtAction(
            nameof(SurveysController.GetById),
            "Surveys",
            new { id = result.Value!.Id },
            result.Value
        );
    }

    /// <summary>
    /// Update a template
    /// </summary>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateTemplateCommand command)
    {
        if (id != command.TemplateId)
            return HttpContext.IdMismatchProblem();

        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
            return result.ToProblemDetails(HttpContext);

        return Ok(result.Value);
    }

    /// <summary>
    /// Delete a template
    /// </summary>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id)
    {
        var result = await _mediator.Send(new DeleteTemplateCommand { TemplateId = id });

        if (!result.IsSuccess)
            return result.ToProblemDetails(HttpContext);

        return NoContent();
    }
}

/// <summary>
/// Request model for creating a survey from a template.
/// </summary>
public record CreateSurveyFromTemplateRequest
{
    public string SurveyTitle { get; init; } = string.Empty;
    public string? Description { get; init; }
}
