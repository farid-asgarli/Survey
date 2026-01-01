using MediatR;
using SurveyApp.Application.Services;
using SurveyApp.Domain.Interfaces;

namespace SurveyApp.Application.Features.Users.Commands.UploadAvatar;

public class UploadAvatarCommandHandler(
    IUserRepository userRepository,
    IUnitOfWork unitOfWork,
    IFileStorageService fileStorageService
) : IRequestHandler<UploadAvatarCommand, UploadAvatarResult>
{
    private readonly IUserRepository _userRepository = userRepository;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;
    private readonly IFileStorageService _fileStorageService = fileStorageService;

    private static readonly string[] AllowedExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
    private const long MaxFileSize = 5 * 1024 * 1024; // 5MB

    public async Task<UploadAvatarResult> Handle(
        UploadAvatarCommand request,
        CancellationToken cancellationToken
    )
    {
        var user = await _userRepository.GetByIdAsync(request.UserId, cancellationToken);
        if (user == null)
        {
            return new UploadAvatarResult(false, null, "User not found");
        }

        var file = request.File;

        // Validate file
        if (file == null || file.Length == 0)
        {
            return new UploadAvatarResult(false, null, "No file provided");
        }

        if (file.Length > MaxFileSize)
        {
            return new UploadAvatarResult(false, null, "File size exceeds 5MB limit");
        }

        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (Array.IndexOf(AllowedExtensions, extension) < 0)
        {
            return new UploadAvatarResult(
                false,
                null,
                "Invalid file type. Allowed types: jpg, jpeg, png, gif, webp"
            );
        }

        try
        {
            // Delete old avatar if exists
            if (!string.IsNullOrEmpty(user.ProfilePictureUrl))
            {
                await _fileStorageService.DeleteFileAsync(
                    user.ProfilePictureUrl,
                    cancellationToken
                );
            }

            // Upload new avatar
            using var stream = file.OpenReadStream();
            var fileName = $"avatars/{request.UserId}/{Guid.NewGuid()}{extension}";
            var avatarUrl = await _fileStorageService.UploadFileAsync(
                stream,
                fileName,
                file.ContentType,
                cancellationToken
            );

            // Update user
            user.UpdateProfilePicture(avatarUrl);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return new UploadAvatarResult(true, avatarUrl, null);
        }
        catch (Exception ex)
        {
            return new UploadAvatarResult(false, null, $"Failed to upload avatar: {ex.Message}");
        }
    }
}
