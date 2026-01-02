using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SurveyApp.Application.DTOs;
using SurveyApp.Application.Features.Auth.Commands.AzureAdLogin;
using SurveyApp.Application.Features.Auth.Commands.ForgotPassword;
using SurveyApp.Application.Features.Auth.Commands.LinkAzureAd;
using SurveyApp.Application.Features.Auth.Commands.Login;
using SurveyApp.Application.Features.Auth.Commands.Logout;
using SurveyApp.Application.Features.Auth.Commands.RefreshToken;
using SurveyApp.Application.Features.Auth.Commands.Register;
using SurveyApp.Application.Features.Auth.Commands.ResetPassword;
using SurveyApp.Application.Features.Auth.Commands.UnlinkAzureAd;

namespace SurveyApp.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(IMediator mediator, IConfiguration configuration) : ApiControllerBase
{
    private readonly IMediator _mediator = mediator;
    private readonly IConfiguration _configuration = configuration;

    /// <summary>
    /// Register a new user
    /// </summary>
    [HttpPost("register")]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Register([FromBody] RegisterCommand command)
    {
        var result = await _mediator.Send(command);
        return HandleResult(result);
    }

    /// <summary>
    /// Login with email and password
    /// </summary>
    [HttpPost("login")]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login([FromBody] LoginCommand command)
    {
        var result = await _mediator.Send(command);
        return HandleResult(result);
    }

    /// <summary>
    /// Refresh an expired token
    /// </summary>
    [HttpPost("refresh")]
    [ProducesResponseType(typeof(TokenRefreshResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Refresh([FromBody] RefreshTokenCommand command)
    {
        var result = await _mediator.Send(command);
        return HandleResult(result);
    }

    /// <summary>
    /// Request a password reset
    /// </summary>
    [HttpPost("forgot-password")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordCommand command)
    {
        var result = await _mediator.Send(command);
        return HandleNoContentResult(result);
    }

    /// <summary>
    /// Reset password with token
    /// </summary>
    [HttpPost("reset-password")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordCommand command)
    {
        var result = await _mediator.Send(command);
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

    #region Azure AD SSO Endpoints

    /// <summary>
    /// Get Azure AD configuration for frontend MSAL initialization.
    /// Returns whether SSO is enabled and necessary configuration values.
    /// </summary>
    [HttpGet("azure-ad/config")]
    [ProducesResponseType(typeof(AzureAdConfigDto), StatusCodes.Status200OK)]
    public IActionResult GetAzureAdConfig()
    {
        var clientId = _configuration["AzureAd:ClientId"];
        var tenantId = _configuration["AzureAd:TenantId"];
        var singleTenant = _configuration.GetValue("AzureAd:SingleTenant", true);

        if (string.IsNullOrEmpty(clientId))
        {
            return Ok(new AzureAdConfigDto { Enabled = false });
        }

        var baseUrl = $"{Request.Scheme}://{Request.Host}";
        var frontendUrl =
            _configuration["AllowedOrigins"]?.Split(',').FirstOrDefault()?.Trim() ?? baseUrl;

        return Ok(
            new AzureAdConfigDto
            {
                Enabled = true,
                ClientId = clientId,
                TenantId = tenantId,
                Authority = singleTenant
                    ? $"https://login.microsoftonline.com/{tenantId}"
                    : "https://login.microsoftonline.com/common",
                RedirectUri = $"{frontendUrl}/auth/azure-callback",
                Scopes = ["openid", "profile", "email"],
            }
        );
    }

    /// <summary>
    /// Authenticate with Azure AD ID token.
    /// Creates a new user or links to existing account automatically.
    /// </summary>
    [HttpPost("azure-ad/login")]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> AzureAdLogin([FromBody] AzureAdLoginCommand command)
    {
        var result = await _mediator.Send(command);
        return HandleResult(result);
    }

    /// <summary>
    /// Link Azure AD account to current authenticated user.
    /// Enables SSO for users who registered with email/password.
    /// </summary>
    [HttpPost("azure-ad/link")]
    [Authorize]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> LinkAzureAdAccount([FromBody] LinkAzureAdCommand command)
    {
        var result = await _mediator.Send(command);
        return HandleResult(result);
    }

    /// <summary>
    /// Unlink Azure AD account from current user.
    /// Requires user to have a password set as alternative login method.
    /// </summary>
    [HttpPost("azure-ad/unlink")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> UnlinkAzureAdAccount()
    {
        var result = await _mediator.Send(new UnlinkAzureAdCommand());
        return HandleNoContentResult(result);
    }

    #endregion
}
