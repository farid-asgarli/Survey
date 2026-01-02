using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SurveyApp.API.Models;
using SurveyApp.Application.DTOs;
using SurveyApp.Application.DTOs.Common;
using SurveyApp.Application.Features.Namespaces.Commands.CreateNamespace;
using SurveyApp.Application.Features.Namespaces.Commands.DeleteNamespace;
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
public class NamespacesController(IMediator mediator) : ApiControllerBase
{
    private readonly IMediator _mediator = mediator;

    /// <summary>
    /// Get all namespaces for the current user
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<NamespaceDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetUserNamespaces()
    {
        var result = await _mediator.Send(new GetUserNamespacesQuery());
        return HandleResult(result);
    }

    /// <summary>
    /// Get a namespace by ID
    /// </summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(NamespaceDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _mediator.Send(new GetNamespaceByIdQuery(id));
        return HandleResult(result);
    }

    /// <summary>
    /// Get a namespace by slug
    /// </summary>
    [HttpGet("by-slug/{slug}")]
    [ProducesResponseType(typeof(NamespaceDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetBySlug(string slug)
    {
        var result = await _mediator.Send(new GetNamespaceBySlugQuery(slug));
        return HandleResult(result);
    }

    /// <summary>
    /// Create a new namespace
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(NamespaceDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] CreateNamespaceCommand command)
    {
        var result = await _mediator.Send(command);
        return HandleCreatedResult(result, nameof(GetById), v => new { id = v.Id });
    }

    /// <summary>
    /// Update a namespace
    /// </summary>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(NamespaceDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateNamespaceRequest request)
    {
        var command = new UpdateNamespaceCommand
        {
            NamespaceId = id,
            Name = request.Name,
            Description = request.Description,
            LogoUrl = request.LogoUrl,
        };

        var result = await _mediator.Send(command);
        return HandleResult(result);
    }

    /// <summary>
    /// Delete a namespace
    /// </summary>
    /// <remarks>
    /// Only the namespace owner can delete a namespace.
    /// This action is irreversible and will delete all associated data.
    /// </remarks>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id)
    {
        var result = await _mediator.Send(new DeleteNamespaceCommand { NamespaceId = id });
        return HandleNoContentResult(result);
    }

    /// <summary>
    /// Get members of a namespace with pagination
    /// </summary>
    /// <param name="id">The namespace ID.</param>
    /// <param name="query">Query parameters for pagination.</param>
    /// <returns>Paginated list of namespace members.</returns>
    [HttpGet("{id:guid}/members")]
    [ProducesResponseType(typeof(PagedResponse<NamespaceMemberDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetMembers(Guid id, [FromQuery] GetNamespaceMembersQuery query)
    {
        var result = await _mediator.Send(query with { NamespaceId = id });
        return HandleResult(result);
    }

    /// <summary>
    /// Invite a user to a namespace
    /// </summary>
    [HttpPost("{id:guid}/members")]
    [ProducesResponseType(typeof(InviteUserResult), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> InviteMember(Guid id, [FromBody] InviteMemberRequest request)
    {
        var command = new InviteUserToNamespaceCommand
        {
            NamespaceId = id,
            Email = request.Email,
            Role = request.Role,
        };

        var result = await _mediator.Send(command);
        return HandleCreatedResult(result, nameof(GetMembers), new { id });
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
        return HandleNoContentResult(result);
    }

    /// <summary>
    /// Update a member's role in a namespace
    /// </summary>
    [HttpPut("{namespaceId:guid}/members/{membershipId:guid}")]
    [ProducesResponseType(typeof(UpdateMemberRoleResult), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateMemberRole(
        Guid namespaceId,
        Guid membershipId,
        [FromBody] UpdateMemberRoleRequest request
    )
    {
        var command = new UpdateMemberRoleCommand
        {
            NamespaceId = namespaceId,
            MembershipId = membershipId,
            Role = request.Role,
        };

        var result = await _mediator.Send(command);
        return HandleResult(result);
    }
}
