using MediatR;

namespace SurveyApp.Application.Features.Users.Commands.UploadAvatar;

/// <summary>
/// Command to upload a user's avatar.
/// </summary>
/// <param name="UserId">The user's ID.</param>
/// <param name="FileStream">The file content stream.</param>
/// <param name="FileName">The original file name.</param>
/// <param name="ContentType">The file's content type (MIME type).</param>
/// <param name="FileSize">The file size in bytes.</param>
public record UploadAvatarCommand(
    Guid UserId,
    Stream FileStream,
    string FileName,
    string ContentType,
    long FileSize
) : IRequest<UploadAvatarResult>;

public record UploadAvatarResult(bool Success, string? AvatarUrl, string? Error);
