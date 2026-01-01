using MediatR;
using Microsoft.Extensions.Options;
using SurveyApp.Application.Services;
using SurveyApp.Application.Services.Files;
using SurveyApp.Domain.Interfaces;

namespace SurveyApp.Application.Features.Users.Commands.UploadAvatar;

public class UploadAvatarCommandHandler(
    IUserRepository userRepository,
    IUnitOfWork unitOfWork,
    IFileStorageService fileStorageService,
    IOptions<FileValidationOptions> fileValidationOptions
) : IRequestHandler<UploadAvatarCommand, UploadAvatarResult>
{
    private readonly IUserRepository _userRepository = userRepository;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;
    private readonly IFileStorageService _fileStorageService = fileStorageService;
    private readonly FileValidationOptions _fileValidationOptions = fileValidationOptions.Value;

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

        // Validate file
        if (request.FileStream == null || request.FileSize == 0)
        {
            return new UploadAvatarResult(false, null, "No file provided");
        }

        if (request.FileSize > _fileValidationOptions.MaxFileSizeBytes)
        {
            var maxSizeMb = _fileValidationOptions.MaxFileSizeBytes / (1024 * 1024);
            return new UploadAvatarResult(false, null, $"File size exceeds {maxSizeMb}MB limit");
        }

        var extension = Path.GetExtension(request.FileName).ToLowerInvariant();
        var allowedExtensions = _fileValidationOptions.AllowedImageExtensions;
        if (!allowedExtensions.Contains(extension))
        {
            var allowedTypes = string.Join(
                ", ",
                allowedExtensions.Select(static e => e.TrimStart('.'))
            );
            return new UploadAvatarResult(
                false,
                null,
                $"Invalid file type. Allowed types: {allowedTypes}"
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
            var fileName = $"avatars/{request.UserId}/{Guid.NewGuid()}{extension}";
            var avatarUrl = await _fileStorageService.UploadFileAsync(
                request.FileStream,
                fileName,
                request.ContentType,
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
