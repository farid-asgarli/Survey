using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;

namespace SurveyApp.Application.Features.Auth.Commands.RefreshToken;

public class RefreshTokenCommandHandler(IIdentityService identityService)
    : IRequestHandler<RefreshTokenCommand, Result<TokenRefreshResponseDto>>
{
    private readonly IIdentityService _identityService = identityService;

    public async Task<Result<TokenRefreshResponseDto>> Handle(
        RefreshTokenCommand request,
        CancellationToken cancellationToken
    )
    {
        var result = await _identityService.RefreshTokenAsync(request.Token, request.RefreshToken);

        if (!result.Succeeded)
        {
            var error = result.Errors.FirstOrDefault() ?? "Errors.InvalidOrExpiredToken";
            return Result<TokenRefreshResponseDto>.Failure(error, "UNAUTHORIZED");
        }

        return Result<TokenRefreshResponseDto>.Success(
            new TokenRefreshResponseDto
            {
                Token = result.Token!,
                RefreshToken = result.RefreshToken!,
                ExpiresAt = result.ExpiresAt!.Value,
            }
        );
    }
}
