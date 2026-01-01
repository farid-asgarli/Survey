using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.DTOs;

namespace SurveyApp.Application.Features.Auth.Commands.Login;

public record LoginCommand : IRequest<Result<AuthResponseDto>>
{
    public required string Email { get; init; }
    public required string Password { get; init; }
    /// <summary>
    /// When true, extends the refresh token expiration for persistent login.
    /// </summary>
    public bool RememberMe { get; init; }
}
