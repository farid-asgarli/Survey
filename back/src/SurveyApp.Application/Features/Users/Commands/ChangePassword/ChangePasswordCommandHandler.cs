using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;

namespace SurveyApp.Application.Features.Users.Commands.ChangePassword;

/// <summary>
/// Handler for changing the current user's password.
/// </summary>
public class ChangePasswordCommandHandler(
    IIdentityService identityService,
    ICurrentUserService currentUserService
) : IRequestHandler<ChangePasswordCommand, Result<Unit>>
{
    private readonly IIdentityService _identityService = identityService;
    private readonly ICurrentUserService _currentUserService = currentUserService;

    public async Task<Result<Unit>> Handle(
        ChangePasswordCommand request,
        CancellationToken cancellationToken
    )
    {
        var userId = _currentUserService.UserId;
        if (!userId.HasValue)
        {
            return Result<Unit>.Unauthorized("Errors.UserNotAuthenticated");
        }

        var success = await _identityService.ChangePasswordAsync(
            userId.Value.ToString(),
            request.CurrentPassword,
            request.NewPassword
        );

        if (!success)
        {
            return Result<Unit>.Failure("Errors.InvalidCurrentPassword");
        }

        return Result<Unit>.Success(Unit.Value);
    }
}
