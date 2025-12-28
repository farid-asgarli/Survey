using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SurveyApp.API.Extensions;
using SurveyApp.Application.DTOs;
using SurveyApp.Application.Features.EmailTemplates.Commands.CreateEmailTemplate;
using SurveyApp.Application.Features.EmailTemplates.Commands.DeleteEmailTemplate;
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
public class EmailTemplatesController(IMediator mediator) : ControllerBase
{
    private readonly IMediator _mediator = mediator;

    /// <summary>
    /// Gets all email templates in the current namespace.
    /// </summary>
    /// <param name="pageNumber">Page number (default: 1).</param>
    /// <param name="pageSize">Page size (default: 20).</param>
    /// <param name="searchTerm">Optional search term.</param>
    /// <param name="type">Optional template type filter.</param>
    /// <returns>List of email templates.</returns>
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<EmailTemplateSummaryDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetEmailTemplates(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? searchTerm = null,
        [FromQuery] EmailTemplateType? type = null
    )
    {
        var query = new GetEmailTemplatesQuery
        {
            PageNumber = pageNumber,
            PageSize = pageSize,
            SearchTerm = searchTerm,
            Type = type,
        };

        var result = await _mediator.Send(query);

        if (!result.IsSuccess)
            return result.ToProblemDetails(HttpContext);

        return Ok(result.Value);
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

        if (!result.IsSuccess)
            return result.ToProblemDetails(HttpContext);

        return Ok(result.Value);
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

        if (!result.IsSuccess)
            return result.ToProblemDetails(HttpContext);

        return CreatedAtAction(
            nameof(GetEmailTemplateById),
            new { id = result.Value!.Id },
            result.Value
        );
    }

    /// <summary>
    /// Updates an existing email template.
    /// </summary>
    /// <param name="id">The template ID.</param>
    /// <param name="request">The update data.</param>
    /// <returns>The updated template.</returns>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(EmailTemplateDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateEmailTemplate(
        Guid id,
        [FromBody] UpdateEmailTemplateDto request
    )
    {
        var command = new UpdateEmailTemplateCommand
        {
            Id = id,
            Name = request.Name,
            Type = request.Type,
            Subject = request.Subject,
            HtmlBody = request.HtmlBody,
            PlainTextBody = request.PlainTextBody,
            DesignJson = request.DesignJson,
            IsDefault = request.IsDefault,
        };

        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
            return result.ToProblemDetails(HttpContext);

        return Ok(result.Value);
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

        if (!result.IsSuccess)
            return result.ToProblemDetails(HttpContext);

        return NoContent();
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
