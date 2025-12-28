using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Localization;
using SurveyApp.Application.DTOs;
using SurveyApp.Infrastructure.Identity;

namespace SurveyApp.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(
    IIdentityService identityService,
    IStringLocalizer<AuthController> localizer
) : ControllerBase
{
    private readonly IIdentityService _identityService = identityService;
    private readonly IStringLocalizer<AuthController> _localizer = localizer;

    /// <summary>
    /// Register a new user
    /// </summary>
    [HttpPost("register")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        var result = await _identityService.RegisterAsync(
            request.Email,
            request.Password,
            request.FirstName,
            request.LastName
        );

        if (!result.Succeeded)
            return BadRequest(
                new ValidationProblemDetails(
                    new Dictionary<string, string[]> { { "", result.Errors.ToArray() } }
                )
                {
                    Type = "https://tools.ietf.org/html/rfc7231#section-6.5.1",
                    Title = "Registration failed.",
                    Status = StatusCodes.Status400BadRequest,
                    Instance = HttpContext.Request.Path,
                }
            );

        return Ok(
            new AuthResponseDto
            {
                Token = result.Token!,
                RefreshToken = result.RefreshToken!,
                ExpiresAt = result.ExpiresAt!.Value,
                User = new AuthUserDto
                {
                    Id = result.UserId!,
                    Email = result.Email!,
                    FirstName = result.FirstName,
                    LastName = result.LastName,
                },
            }
        );
    }

    /// <summary>
    /// Login with email and password
    /// </summary>
    [HttpPost("login")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var result = await _identityService.LoginAsync(request.Email, request.Password);

        if (!result.Succeeded)
            return Unauthorized(
                new ProblemDetails
                {
                    Type = "https://tools.ietf.org/html/rfc7231#section-6.5.1",
                    Title = "Authentication failed.",
                    Status = StatusCodes.Status401Unauthorized,
                    Detail =
                        result.Errors.FirstOrDefault() ?? _localizer["Errors.InvalidCredentials"],
                    Instance = HttpContext.Request.Path,
                }
            );

        return Ok(
            new AuthResponseDto
            {
                Token = result.Token!,
                RefreshToken = result.RefreshToken!,
                ExpiresAt = result.ExpiresAt!.Value,
                User = new AuthUserDto
                {
                    Id = result.UserId!,
                    Email = result.Email!,
                    FirstName = result.FirstName,
                    LastName = result.LastName,
                },
            }
        );
    }

    /// <summary>
    /// Refresh an expired token
    /// </summary>
    [HttpPost("refresh")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Refresh([FromBody] RefreshTokenRequest request)
    {
        var result = await _identityService.RefreshTokenAsync(request.Token, request.RefreshToken);

        if (!result.Succeeded)
            return Unauthorized(
                new ProblemDetails
                {
                    Type = "https://tools.ietf.org/html/rfc7231#section-6.5.1",
                    Title = "Token refresh failed.",
                    Status = StatusCodes.Status401Unauthorized,
                    Detail =
                        result.Errors.FirstOrDefault()
                        ?? _localizer["Errors.InvalidOrExpiredToken"],
                    Instance = HttpContext.Request.Path,
                }
            );

        return Ok(
            new TokenRefreshResponseDto
            {
                Token = result.Token!,
                RefreshToken = result.RefreshToken!,
                ExpiresAt = result.ExpiresAt!.Value,
            }
        );
    }

    /// <summary>
    /// Request a password reset
    /// </summary>
    [HttpPost("forgot-password")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
    {
        var token = await _identityService.GeneratePasswordResetTokenAsync(request.Email);

        // In production, send this token via email
        // For now, we just return success (204 No Content is more appropriate)
        return NoContent();
    }

    /// <summary>
    /// Reset password with token
    /// </summary>
    [HttpPost("reset-password")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
    {
        var result = await _identityService.ResetPasswordAsync(
            request.Email,
            request.Token,
            request.NewPassword
        );

        if (!result)
            return BadRequest(
                new ProblemDetails
                {
                    Type = "https://tools.ietf.org/html/rfc7231#section-6.5.1",
                    Title = "Password reset failed.",
                    Status = StatusCodes.Status400BadRequest,
                    Detail = _localizer["Errors.InvalidTokenOrEmail"],
                    Instance = HttpContext.Request.Path,
                }
            );

        return NoContent();
    }
}

public record RegisterRequest(string Email, string Password, string FirstName, string LastName);

public record LoginRequest(string Email, string Password);

public record RefreshTokenRequest(string Token, string RefreshToken);

public record ForgotPasswordRequest(string Email);

public record ResetPasswordRequest(string Email, string Token, string NewPassword);
