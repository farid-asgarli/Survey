using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SurveyApp.Application.DTOs;
using SurveyApp.Application.DTOs.Common;
using SurveyApp.Application.Features.EmailTemplates.Commands.CreateEmailTemplate;
using SurveyApp.Application.Features.EmailTemplates.Commands.DeleteEmailTemplate;
using SurveyApp.Application.Features.EmailTemplates.Commands.DuplicateEmailTemplate;
using SurveyApp.Application.Features.EmailTemplates.Commands.UpdateEmailTemplate;
using SurveyApp.Application.Features.EmailTemplates.Queries.GetEmailTemplateById;
using SurveyApp.Application.Features.EmailTemplates.Queries.GetEmailTemplates;
using SurveyApp.Domain.Enums;

namespace SurveyApp.API.Controllers;

/// <summary>
/// Controller for managing email templates.
/// </summary>
[ApiController]
[Route("api/email-templates")]
[Authorize]
public class EmailTemplatesController(IMediator mediator) : ApiControllerBase
{
    private readonly IMediator _mediator = mediator;

    /// <summary>
    /// Gets all email templates in the current namespace.
    /// </summary>
    /// <param name="query">Query parameters for filtering and pagination.</param>
    /// <returns>List of email templates.</returns>
    [HttpGet]
    [ProducesResponseType(typeof(PagedResponse<EmailTemplateSummaryDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetEmailTemplates([FromQuery] GetEmailTemplatesQuery query)
    {
        var result = await _mediator.Send(query);
        return HandleResult(result);
    }

    /// <summary>
    /// Gets an email template by its ID.
    /// </summary>
    /// <param name="id">The template ID.</param>
    /// <returns>The template details.</returns>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(EmailTemplateDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetEmailTemplateById(Guid id)
    {
        var result = await _mediator.Send(new GetEmailTemplateByIdQuery(id));

        return HandleResult(result);
    }

    /// <summary>
    /// Creates a new email template.
    /// </summary>
    /// <param name="request">The template data.</param>
    /// <returns>The created template.</returns>
    [HttpPost]
    [ProducesResponseType(typeof(EmailTemplateDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateEmailTemplate(
        [FromBody] CreateEmailTemplateCommand request
    )
    {
        var result = await _mediator.Send(request);

        return HandleCreatedResult(result, nameof(GetEmailTemplateById), v => new { id = v.Id });
    }

    /// <summary>
    /// Updates an existing email template.
    /// </summary>
    /// <param name="id">The template ID.</param>
    /// <param name="command">The update command.</param>
    /// <returns>The updated template.</returns>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(EmailTemplateDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateEmailTemplate(
        Guid id,
        [FromBody] UpdateEmailTemplateCommand command
    )
    {
        if (ValidateIdMatch(id, command.Id) is { } mismatchResult)
            return mismatchResult;

        var result = await _mediator.Send(command);

        return HandleResult(result);
    }

    /// <summary>
    /// Deletes an email template.
    /// </summary>
    /// <param name="id">The template ID.</param>
    /// <returns>No content.</returns>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteEmailTemplate(Guid id)
    {
        var result = await _mediator.Send(new DeleteEmailTemplateCommand(id));

        return HandleNoContentResult(result);
    }

    /// <summary>
    /// Duplicates an existing email template.
    /// Creates a copy with all content and translations, but as a non-default template.
    /// </summary>
    /// <param name="id">The template ID to duplicate.</param>
    /// <param name="command">Optional command with new name for the duplicate.</param>
    /// <returns>The duplicated template.</returns>
    [HttpPost("{id:guid}/duplicate")]
    [ProducesResponseType(typeof(EmailTemplateDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DuplicateEmailTemplate(
        Guid id,
        [FromBody] DuplicateEmailTemplateCommand? command = null
    )
    {
        var result = await _mediator.Send(new DuplicateEmailTemplateCommand(id, command?.NewName));

        return HandleCreatedResult(result, nameof(GetEmailTemplateById), v => new { id = v.Id });
    }

    /// <summary>
    /// Gets the available placeholders for email templates.
    /// </summary>
    /// <returns>List of available placeholders.</returns>
    [HttpGet("placeholders")]
    [ProducesResponseType(typeof(string[]), StatusCodes.Status200OK)]
    public IActionResult GetAvailablePlaceholders()
    {
        return Ok(Domain.Entities.EmailTemplate.StandardPlaceholders);
    }
}
