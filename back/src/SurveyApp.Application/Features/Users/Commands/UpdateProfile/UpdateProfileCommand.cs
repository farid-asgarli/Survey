using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.DTOs;

namespace SurveyApp.Application.Features.Users.Commands.UpdateProfile;

public record UpdateProfileCommand : IRequest<Result<UserDto>>
{
    public string FirstName { get; init; } = string.Empty;
    public string LastName { get; init; } = string.Empty;

    /// <summary>
    /// The avatar ID to set (e.g., "avatar-1", "avatar-32"). Use null to clear.
    /// </summary>
    public string? AvatarId { get; init; }
}
