using MediatR;
using Microsoft.AspNetCore.Http;

namespace SurveyApp.Application.Features.Users.Commands.UploadAvatar;

public record UploadAvatarCommand(Guid UserId, IFormFile File) : IRequest<UploadAvatarResult>;

public record UploadAvatarResult(bool Success, string? AvatarUrl, string? Error);
