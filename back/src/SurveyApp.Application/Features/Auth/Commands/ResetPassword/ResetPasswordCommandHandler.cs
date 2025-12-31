using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Infrastructure.Identity;

namespace SurveyApp.Application.Features.Auth.Commands.ResetPassword;

public class ResetPasswordCommandHandler(IIdentityService identityService)
    : IRequestHandler<ResetPasswordCommand, Result<Unit>>
{
    private readonly IIdentityService _identityService = identityService;

    public async Task<Result<Unit>> Handle(
        ResetPasswordCommand request,
        CancellationToken cancellationToken
    )
    {
        var result = await _identityService.ResetPasswordAsync(
            request.Email,
            request.Token,
            request.NewPassword
        );

        if (!result)
        {
            return Result<Unit>.Failure("Errors.InvalidTokenOrEmail");
        }

        return Result<Unit>.Success(Unit.Value);
    }
}
