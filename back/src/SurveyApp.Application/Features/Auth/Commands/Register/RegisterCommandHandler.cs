using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;

namespace SurveyApp.Application.Features.Auth.Commands.Register;

public class RegisterCommandHandler(IIdentityService identityService)
    : IRequestHandler<RegisterCommand, Result<AuthResponseDto>>
{
    private readonly IIdentityService _identityService = identityService;

    public async Task<Result<AuthResponseDto>> Handle(
        RegisterCommand request,
        CancellationToken cancellationToken
    )
    {
        var result = await _identityService.RegisterAsync(
            request.Email,
            request.Password,
            request.FirstName,
            request.LastName
        );

        if (!result.Succeeded)
        {
            return Result<AuthResponseDto>.ValidationFailure(result.Errors.ToArray());
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
