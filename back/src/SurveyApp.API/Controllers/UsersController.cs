using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SurveyApp.Application.Features.Users.Commands.ChangePassword;
using SurveyApp.Application.Features.Users.Commands.SelectAvatar;
using SurveyApp.Application.Features.Users.Commands.UpdateProfile;
using SurveyApp.Application.Features.Users.Commands.UpdateUserPreferences;
using SurveyApp.Application.Features.Users.Queries.GetCurrentUser;
using SurveyApp.Application.Features.Users.Queries.GetUserPreferences;

namespace SurveyApp.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController(IMediator mediator) : ApiControllerBase
{
    private readonly IMediator _mediator = mediator;

    /// <summary>
    /// Get the current user's profile
    /// </summary>
    [HttpGet("me")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetCurrentUser()
    {
        var result = await _mediator.Send(new GetCurrentUserQuery());
        return HandleResult(result);
    }

    /// <summary>
    /// Update the current user's profile
    /// </summary>
    [HttpPut("me")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileCommand command)
    {
        var result = await _mediator.Send(command);
        return HandleResult(result);
    }

    /// <summary>
    /// Get the current user's preferences/settings
    /// </summary>
    [HttpGet("settings")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetUserPreferences()
    {
        var result = await _mediator.Send(new GetUserPreferencesQuery());
        return HandleResult(result);
    }

    /// <summary>
    /// Update the current user's preferences/settings
    /// </summary>
    [HttpPut("settings")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> UpdateUserPreferences(
        [FromBody] UpdateUserPreferencesCommand command
    )
    {
        var result = await _mediator.Send(command);
        return HandleResult(result);
    }

    /// <summary>
    /// Change the current user's password
    /// </summary>
    [HttpPost("me/password")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordCommand command)
    {
        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
        {
            return HandleResult(result);
        }

        return Ok(new { message = "Password changed successfully" });
    }

    /// <summary>
    /// Select an avatar from the predefined collection
    /// </summary>
    /// <remarks>
    /// Allows users to select an avatar from the predefined 3D avatar collection.
    /// Pass avatarId as null to clear the current avatar.
    /// Valid avatar IDs: avatar-01 through avatar-77
    /// </remarks>
    [HttpPost("me/avatar")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> SelectAvatar([FromBody] SelectAvatarCommand command)
    {
        var result = await _mediator.Send(command);

        if (!result.Success)
        {
            return BadRequest(new { error = result.Error });
        }

        return Ok(new { avatarId = result.AvatarId });
    }

    /// <summary>
    /// Clear the current user's avatar
    /// </summary>
    [HttpDelete("me/avatar")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> ClearAvatar()
    {
        var result = await _mediator.Send(new SelectAvatarCommand(null));

        if (!result.Success)
        {
            return BadRequest(new { error = result.Error });
        }

        return Ok(new { message = "Avatar cleared successfully" });
    }
}
