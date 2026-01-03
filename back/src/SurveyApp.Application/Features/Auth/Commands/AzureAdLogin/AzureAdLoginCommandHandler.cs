using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;

namespace SurveyApp.Application.Features.Auth.Commands.AzureAdLogin;

/// <summary>
/// Handler for Azure AD login command.
/// Validates the Azure AD token and returns authentication result.
/// </summary>
public class AzureAdLoginCommandHandler(IIdentityService identityService)
    : IRequestHandler<AzureAdLoginCommand, Result<AuthResponseDto>>
{
    private readonly IIdentityService _identityService = identityService;

    public async Task<Result<AuthResponseDto>> Handle(
        AzureAdLoginCommand request,
        CancellationToken cancellationToken
    )
    {
        var result = await _identityService.AuthenticateWithAzureAdAsync(
            request.IdToken,
            request.AccessToken
        );

        if (!result.Succeeded)
        {
            var error = result.Errors.FirstOrDefault() ?? "Errors.AzureAdAuthenticationFailed";
            return Result<AuthResponseDto>.Failure(error, "UNAUTHORIZED");
        }

        return Result<AuthResponseDto>.Success(
            new AuthResponseDto
            {
                Token = result.Token!,
                RefreshToken = result.RefreshToken!,
                ExpiresAt = result.ExpiresAt!.Value,
                User = new AuthUserDto
                {
                    Id = result.UserId!,
                    Email = result.Email!,
                    FirstName = result.FirstName!,
                    LastName = result.LastName!,
                    FullName = result.FullName!,
                    EmailConfirmed = result.EmailConfirmed,
                    AvatarId = result.AvatarId,
                    LastLoginAt = result.LastLoginAt,
                    IsActive = result.IsActive,
                    CreatedAt = result.CreatedAt ?? DateTime.UtcNow,
                    UpdatedAt = result.UpdatedAt,
                },
            }
        );
    }
}
