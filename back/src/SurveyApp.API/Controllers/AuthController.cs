using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SurveyApp.Application.DTOs;
using SurveyApp.Application.Features.Auth.Commands.ForgotPassword;
using SurveyApp.Application.Features.Auth.Commands.Login;
using SurveyApp.Application.Features.Auth.Commands.Logout;
using SurveyApp.Application.Features.Auth.Commands.RefreshToken;
using SurveyApp.Application.Features.Auth.Commands.Register;
using SurveyApp.Application.Features.Auth.Commands.ResetPassword;

namespace SurveyApp.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(IMediator mediator) : ApiControllerBase
{
    private readonly IMediator _mediator = mediator;

    /// <summary>
    /// Register a new user
    /// </summary>
    [HttpPost("register")]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        var result = await _mediator.Send(
            new RegisterCommand
            {
                Email = request.Email,
                Password = request.Password,
                FirstName = request.FirstName,
                LastName = request.LastName,
            }
        );

        return HandleResult(result);
    }

    /// <summary>
    /// Login with email and password
    /// </summary>
    [HttpPost("login")]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var result = await _mediator.Send(
            new LoginCommand { Email = request.Email, Password = request.Password }
        );

        return HandleResult(result);
    }

    /// <summary>
    /// Refresh an expired token
    /// </summary>
    [HttpPost("refresh")]
    [ProducesResponseType(typeof(TokenRefreshResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Refresh([FromBody] RefreshTokenRequest request)
    {
        var result = await _mediator.Send(
            new RefreshTokenCommand { Token = request.Token, RefreshToken = request.RefreshToken }
        );

        return HandleResult(result);
    }

    /// <summary>
    /// Request a password reset
    /// </summary>
    [HttpPost("forgot-password")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
    {
        var result = await _mediator.Send(new ForgotPasswordCommand { Email = request.Email });

        return HandleNoContentResult(result);
    }

    /// <summary>
    /// Reset password with token
    /// </summary>
    [HttpPost("reset-password")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
    {
        var result = await _mediator.Send(
            new ResetPasswordCommand
            {
                Email = request.Email,
                Token = request.Token,
                NewPassword = request.NewPassword,
            }
        );

        return HandleNoContentResult(result);
    }

    /// <summary>
    /// Logout and revoke the user's refresh token
    /// </summary>
    [HttpPost("logout")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Logout()
    {
        var result = await _mediator.Send(new LogoutCommand());

        return HandleNoContentResult(result);
    }
}

public record RegisterRequest(string Email, string Password, string FirstName, string LastName);

public record LoginRequest(string Email, string Password);

public record RefreshTokenRequest(string Token, string RefreshToken);

public record ForgotPasswordRequest(string Email);

public record ResetPasswordRequest(string Email, string Token, string NewPassword);
