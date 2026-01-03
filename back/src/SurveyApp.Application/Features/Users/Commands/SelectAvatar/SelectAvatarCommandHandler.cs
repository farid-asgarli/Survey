using System.Text.RegularExpressions;
using MediatR;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Domain.Interfaces;

namespace SurveyApp.Application.Features.Users.Commands.SelectAvatar;

public partial class SelectAvatarCommandHandler(
    IUserRepository userRepository,
    IUnitOfWork unitOfWork,
    ICurrentUserService currentUserService
) : IRequestHandler<SelectAvatarCommand, SelectAvatarResult>
{
    private readonly IUserRepository _userRepository = userRepository;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;
    private readonly ICurrentUserService _currentUserService = currentUserService;

    /// <summary>
    /// Total number of available avatars in the collection.
    /// These are stored in /public/images/avatars/ on the frontend.
    /// </summary>
    private const int TotalAvatars = 77;

    /// <summary>
    /// Regex pattern for valid avatar IDs (avatar-1 through avatar-77).
    /// Matches 1-2 digit numbers without leading zeros.
    /// </summary>
    [GeneratedRegex(@"^avatar-(\d{1,2})$", RegexOptions.Compiled)]
    private static partial Regex AvatarIdPattern();

    public async Task<SelectAvatarResult> Handle(
        SelectAvatarCommand request,
        CancellationToken cancellationToken
    )
    {
        var userId = _currentUserService.UserId;
        if (userId == null)
        {
            return new SelectAvatarResult(false, null, "User not authenticated");
        }

        // Use GetByIdForUpdateAsync to enable change tracking for persistence
        var user = await _userRepository.GetByIdForUpdateAsync(userId.Value, cancellationToken);
        if (user == null)
        {
            return new SelectAvatarResult(false, null, "User not found");
        }

        // If clearing the avatar
        if (string.IsNullOrEmpty(request.AvatarId))
        {
            user.UpdateAvatarId(null);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            return new SelectAvatarResult(true, null, null);
        }

        // Validate avatar ID format
        var match = AvatarIdPattern().Match(request.AvatarId);
        if (!match.Success)
        {
            return new SelectAvatarResult(
                false,
                null,
                "Invalid avatar ID format. Expected format: avatar-N (e.g., avatar-1, avatar-32)"
            );
        }

        // Validate avatar number is within range
        var avatarNumber = int.Parse(match.Groups[1].Value);
        if (avatarNumber < 1 || avatarNumber > TotalAvatars)
        {
            return new SelectAvatarResult(
                false,
                null,
                $"Avatar not found. Valid range: avatar-1 to avatar-{TotalAvatars}"
            );
        }

        // Store the avatar ID (not the full URL - frontend handles URL mapping)
        user.UpdateAvatarId(request.AvatarId);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new SelectAvatarResult(true, request.AvatarId, null);
    }
}
