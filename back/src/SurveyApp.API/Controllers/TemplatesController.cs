using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SurveyApp.API.Extensions;
using SurveyApp.Application.DTOs;
using SurveyApp.Application.DTOs.Common;
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
    [ProducesResponseType(typeof(PagedResponse<SurveyTemplateSummaryDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetTemplates([FromQuery] GetTemplatesQuery query)
    {
        var result = await _mediator.Send(query);
        return HandleResult(result);
    }

    /// <summary>
    /// Get a template by ID
    /// </summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(SurveyTemplateDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _mediator.Send(new GetTemplateByIdQuery(id));
        return HandleResult(result);
    }

    /// <summary>
    /// Create a new template
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(SurveyTemplateDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] CreateTemplateCommand command)
    {
        var result = await _mediator.Send(command);
        return HandleCreatedResult(result, nameof(GetById), v => new { id = v.Id });
    }

    /// <summary>
    /// Create a template from an existing survey
    /// </summary>
    [HttpPost("from-survey")]
    [ProducesResponseType(typeof(SurveyTemplateDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateFromSurvey(
        [FromBody] CreateTemplateFromSurveyCommand command
    )
    {
        var result = await _mediator.Send(command);
        return HandleCreatedResult(result, nameof(GetById), v => new { id = v.Id });
    }

    /// <summary>
    /// Create a survey from a template
    /// </summary>
    [HttpPost("{id:guid}/create-survey")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateSurveyFromTemplate(
        Guid id,
        [FromBody] CreateSurveyFromTemplateCommand command
    )
    {
        if (ValidateIdMatch(id, command.TemplateId) is { } mismatchResult)
            return mismatchResult;

        var result = await _mediator.Send(command);

        if (result.IsSuccess && result.Value != null)
        {
            return CreatedAtAction(
                nameof(SurveysController.GetById),
                "Surveys",
                new { id = result.Value.Id },
                result.Value
            );
        }

        return result.ToProblemDetails(HttpContext);
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
        if (ValidateIdMatch(id, command.TemplateId) is { } mismatchResult)
            return mismatchResult;

        var result = await _mediator.Send(command);
        return HandleResult(result);
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
        var result = await _mediator.Send(new DeleteTemplateCommand(id));
        return HandleNoContentResult(result);
    }
}
