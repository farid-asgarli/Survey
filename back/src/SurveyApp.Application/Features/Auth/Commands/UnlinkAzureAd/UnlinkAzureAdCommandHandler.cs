using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;

namespace SurveyApp.Application.Features.Auth.Commands.UnlinkAzureAd;

/// <summary>
/// Handler for unlinking Azure AD account from user.
/// </summary>
public class UnlinkAzureAdCommandHandler(
    IIdentityService identityService,
    ICurrentUserService currentUser
) : IRequestHandler<UnlinkAzureAdCommand, Result<Unit>>
{
    private readonly IIdentityService _identityService = identityService;
    private readonly ICurrentUserService _currentUser = currentUser;

    public async Task<Result<Unit>> Handle(
        UnlinkAzureAdCommand request,
        CancellationToken cancellationToken
    )
    {
        var userId = _currentUser.UserId;
        if (!userId.HasValue)
        {
            return Result<Unit>.Unauthorized("Errors.NotAuthenticated");
        }

        var success = await _identityService.UnlinkAzureAdAccountAsync(userId.Value.ToString());

        if (!success)
        {
            return Result<Unit>.Failure(
                "Errors.UnlinkAzureAdFailed.SetPasswordFirst",
                "BAD_REQUEST"
            );
        }

        return Result<Unit>.Success(Unit.Value);
    }
}
