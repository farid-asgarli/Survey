using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.DTOs;

namespace SurveyApp.Application.Features.Auth.Commands.RefreshToken;

public record RefreshTokenCommand : IRequest<Result<TokenRefreshResponseDto>>
{
    public required string Token { get; init; }
    public required string RefreshToken { get; init; }
}
