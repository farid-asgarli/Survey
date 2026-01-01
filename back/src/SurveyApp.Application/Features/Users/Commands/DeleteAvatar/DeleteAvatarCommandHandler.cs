using MediatR;
using SurveyApp.Application.Services;
using SurveyApp.Domain.Interfaces;

namespace SurveyApp.Application.Features.Users.Commands.DeleteAvatar;

public class DeleteAvatarCommandHandler(
    IUserRepository userRepository,
    IUnitOfWork unitOfWork,
    IFileStorageService fileStorageService
) : IRequestHandler<DeleteAvatarCommand, DeleteAvatarResult>
{
    private readonly IUserRepository _userRepository = userRepository;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;
    private readonly IFileStorageService _fileStorageService = fileStorageService;

    public async Task<DeleteAvatarResult> Handle(
        DeleteAvatarCommand request,
        CancellationToken cancellationToken
    )
    {
        var user = await _userRepository.GetByIdAsync(request.UserId, cancellationToken);
        if (user == null)
        {
            return new DeleteAvatarResult(false, "User not found");
        }

        if (string.IsNullOrEmpty(user.ProfilePictureUrl))
        {
            return new DeleteAvatarResult(true, null); // Already no avatar
        }

        try
        {
            // Delete avatar file
            await _fileStorageService.DeleteFileAsync(user.ProfilePictureUrl, cancellationToken);

            // Clear user's profile picture
            user.UpdateProfilePicture(null);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return new DeleteAvatarResult(true, null);
        }
        catch (Exception ex)
        {
            return new DeleteAvatarResult(false, $"Failed to delete avatar: {ex.Message}");
        }
    }
}
