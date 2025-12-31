using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Localization;
using SurveyApp.API.Extensions;
using SurveyApp.Application.Features.Namespaces.Commands.CreateNamespace;
using SurveyApp.Application.Features.Namespaces.Commands.InviteUser;
using SurveyApp.Application.Features.Namespaces.Commands.RemoveMember;
using SurveyApp.Application.Features.Namespaces.Commands.UpdateMemberRole;
using SurveyApp.Application.Features.Namespaces.Commands.UpdateNamespace;
using SurveyApp.Application.Features.Namespaces.Queries.GetNamespaceById;
using SurveyApp.Application.Features.Namespaces.Queries.GetNamespaceBySlug;
using SurveyApp.Application.Features.Namespaces.Queries.GetNamespaceMembers;
using SurveyApp.Application.Features.Namespaces.Queries.GetUserNamespaces;

namespace SurveyApp.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NamespacesController(
    IMediator mediator,
    IStringLocalizer<NamespacesController> localizer
) : ControllerBase
{
    private readonly IMediator _mediator = mediator;
    private readonly IStringLocalizer<NamespacesController> _localizer = localizer;

    /// <summary>
    /// Get all namespaces for the current user
    /// </summary>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetUserNamespaces()
    {
        var result = await _mediator.Send(new GetUserNamespacesQuery());

        if (!result.IsSuccess)
            return result.ToProblemDetails(HttpContext);

        return Ok(result.Value);
    }

    /// <summary>
    /// Get a namespace by ID
    /// </summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _mediator.Send(new GetNamespaceByIdQuery { NamespaceId = id });

        if (!result.IsSuccess)
            return result.ToProblemDetails(HttpContext);

        return Ok(result.Value);
    }

    /// <summary>
    /// Get a namespace by slug
    /// </summary>
    [HttpGet("by-slug/{slug}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetBySlug(string slug)
    {
        var result = await _mediator.Send(new GetNamespaceBySlugQuery { Slug = slug });

        if (!result.IsSuccess)
            return result.ToProblemDetails(HttpContext);

        return Ok(result.Value);
    }

    /// <summary>
    /// Create a new namespace
    /// </summary>
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] CreateNamespaceCommand command)
    {
        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
            return result.ToProblemDetails(HttpContext);

        return CreatedAtAction(nameof(GetById), new { id = result.Value!.Id }, result.Value);
    }

    /// <summary>
    /// Update a namespace
    /// </summary>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateNamespaceCommand command)
    {
        if (id != command.NamespaceId)
            return BadRequest(
                new ProblemDetails
                {
                    Type = "https://tools.ietf.org/html/rfc7231#section-6.5.1",
                    Title = _localizer["Errors.BadRequest"],
                    Status = StatusCodes.Status400BadRequest,
                    Detail = _localizer["Errors.IdMismatch"],
                    Instance = HttpContext.Request.Path,
                }
            );

        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
            return result.ToProblemDetails(HttpContext);

        return Ok(result.Value);
    }

    /// <summary>
    /// Get members of a namespace
    /// </summary>
    [HttpGet("{id:guid}/members")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetMembers(Guid id)
    {
        var result = await _mediator.Send(new GetNamespaceMembersQuery { NamespaceId = id });

        if (!result.IsSuccess)
            return result.ToProblemDetails(HttpContext);

        return Ok(result.Value);
    }

    /// <summary>
    /// Invite a user to a namespace
    /// </summary>
    [HttpPost("{id:guid}/members")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> InviteMember(
        Guid id,
        [FromBody] InviteUserToNamespaceCommand command
    )
    {
        if (id != command.NamespaceId)
            return BadRequest(
                new ProblemDetails
                {
                    Type = "https://tools.ietf.org/html/rfc7231#section-6.5.1",
                    Title = _localizer["Errors.BadRequest"],
                    Status = StatusCodes.Status400BadRequest,
                    Detail = _localizer["Errors.IdMismatch"],
                    Instance = HttpContext.Request.Path,
                }
            );

        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
            return result.ToProblemDetails(HttpContext);

        return CreatedAtAction(nameof(GetMembers), new { id }, result.Value);
    }

    /// <summary>
    /// Remove a member from a namespace
    /// </summary>
    [HttpDelete("{namespaceId:guid}/members/{membershipId:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RemoveMember(Guid namespaceId, Guid membershipId)
    {
        var result = await _mediator.Send(
            new RemoveMemberCommand { NamespaceId = namespaceId, MembershipId = membershipId }
        );

        if (!result.IsSuccess)
            return result.ToProblemDetails(HttpContext);

        return NoContent();
    }

    /// <summary>
    /// Update a member's role in a namespace
    /// </summary>
    [HttpPut("{namespaceId:guid}/members/{membershipId:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateMemberRole(
        Guid namespaceId,
        Guid membershipId,
        [FromBody] UpdateMemberRoleCommand command
    )
    {
        if (namespaceId != command.NamespaceId || membershipId != command.MembershipId)
            return BadRequest(
                new ProblemDetails
                {
                    Type = "https://tools.ietf.org/html/rfc7231#section-6.5.1",
                    Title = "Bad request.",
                    Status = StatusCodes.Status400BadRequest,
                    Detail = _localizer["Errors.IdMismatch"],
                    Instance = HttpContext.Request.Path,
                }
            );

        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
            return result.ToProblemDetails(HttpContext);

        return Ok(result.Value);
    }
}
