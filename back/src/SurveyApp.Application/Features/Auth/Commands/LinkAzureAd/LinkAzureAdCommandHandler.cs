using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;

namespace SurveyApp.Application.Features.Auth.Commands.LinkAzureAd;

/// <summary>
/// Handler for linking Azure AD account to existing user.
/// </summary>
public class LinkAzureAdCommandHandler(
    IIdentityService identityService,
    ICurrentUserService currentUser
) : IRequestHandler<LinkAzureAdCommand, Result<AuthResponseDto>>
{
    private readonly IIdentityService _identityService = identityService;
    private readonly ICurrentUserService _currentUser = currentUser;

    public async Task<Result<AuthResponseDto>> Handle(
        LinkAzureAdCommand request,
        CancellationToken cancellationToken
    )
    {
        var userId = _currentUser.UserId;
        if (!userId.HasValue)
        {
            return Result<AuthResponseDto>.Unauthorized("Errors.NotAuthenticated");
        }

        var result = await _identityService.LinkAzureAdAccountAsync(
            userId.Value.ToString(),
            request.IdToken
        );

        if (!result.Succeeded)
        {
            var error = result.Errors.FirstOrDefault() ?? "Errors.AccountLinkingFailed";
            return Result<AuthResponseDto>.Failure(error, "BAD_REQUEST");
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
                    AvatarUrl = result.AvatarUrl,
                    ProfilePictureUrl = result.ProfilePictureUrl,
                    LastLoginAt = result.LastLoginAt,
                    IsActive = result.IsActive,
                    CreatedAt = result.CreatedAt ?? DateTime.UtcNow,
                    UpdatedAt = result.UpdatedAt,
                },
            }
        );
    }
}
