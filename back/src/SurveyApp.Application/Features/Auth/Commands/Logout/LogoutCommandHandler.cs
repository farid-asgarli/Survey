using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Infrastructure.Identity;

namespace SurveyApp.Application.Features.Auth.Commands.Logout;

public class LogoutCommandHandler(IIdentityService identityService, ICurrentUserService currentUser)
    : IRequestHandler<LogoutCommand, Result<Unit>>
{
    private readonly IIdentityService _identityService = identityService;
    private readonly ICurrentUserService _currentUser = currentUser;

    public async Task<Result<Unit>> Handle(
        LogoutCommand request,
        CancellationToken cancellationToken
    )
    {
        var userId = _currentUser.UserId;
        if (string.IsNullOrEmpty(userId))
        {
            return Result<Unit>.Failure("Errors.NotAuthenticated", "UNAUTHORIZED");
        }

        await _identityService.RevokeTokenAsync(userId);
        return Result<Unit>.Success(Unit.Value);
    }
}
