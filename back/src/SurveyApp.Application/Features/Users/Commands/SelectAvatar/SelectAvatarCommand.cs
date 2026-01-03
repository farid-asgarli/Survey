using MediatR;

namespace SurveyApp.Application.Features.Users.Commands.SelectAvatar;

/// <summary>
/// Command to select a predefined avatar for the user.
/// </summary>
/// <param name="AvatarId">
/// The avatar ID from the predefined collection (e.g., "avatar-1", "avatar-32", "avatar-77").
/// Pass null to clear the avatar.
/// </param>
public record SelectAvatarCommand(string? AvatarId) : IRequest<SelectAvatarResult>;

public record SelectAvatarResult(bool Success, string? AvatarId, string? Error);
