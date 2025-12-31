using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
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
}
