using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.DTOs;
using SurveyApp.Infrastructure.Identity;

namespace SurveyApp.Application.Features.Auth.Commands.Login;

public class LoginCommandHandler(IIdentityService identityService)
    : IRequestHandler<LoginCommand, Result<AuthResponseDto>>
{
    private readonly IIdentityService _identityService = identityService;

    public async Task<Result<AuthResponseDto>> Handle(
        LoginCommand request,
        CancellationToken cancellationToken
    )
    {
        var result = await _identityService.LoginAsync(request.Email, request.Password);

        if (!result.Succeeded)
        {
            var error = result.Errors.FirstOrDefault() ?? "Errors.InvalidCredentials";
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
                    FirstName = result.FirstName,
                    LastName = result.LastName,
                },
            }
        );
    }
}
