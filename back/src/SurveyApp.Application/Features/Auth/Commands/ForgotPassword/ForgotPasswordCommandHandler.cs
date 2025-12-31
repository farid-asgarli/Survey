using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;

namespace SurveyApp.Application.Features.Auth.Commands.ForgotPassword;

public class ForgotPasswordCommandHandler(IIdentityService identityService)
    : IRequestHandler<ForgotPasswordCommand, Result<Unit>>
{
    private readonly IIdentityService _identityService = identityService;

    public async Task<Result<Unit>> Handle(
        ForgotPasswordCommand request,
        CancellationToken cancellationToken
    )
    {
        // Generate the password reset token
        // In production, this would trigger an email
        await _identityService.GeneratePasswordResetTokenAsync(request.Email);

        // Always return success to prevent email enumeration attacks
        return Result<Unit>.Success(Unit.Value);
    }
}
