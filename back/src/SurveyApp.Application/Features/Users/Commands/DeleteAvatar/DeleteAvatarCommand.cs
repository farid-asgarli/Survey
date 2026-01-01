using MediatR;

namespace SurveyApp.Application.Features.Users.Commands.DeleteAvatar;

public record DeleteAvatarCommand(Guid UserId) : IRequest<DeleteAvatarResult>;

public record DeleteAvatarResult(bool Success, string? Error);
