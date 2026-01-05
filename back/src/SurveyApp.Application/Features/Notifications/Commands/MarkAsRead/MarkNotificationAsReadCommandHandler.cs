using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Domain.Interfaces;

namespace SurveyApp.Application.Features.Notifications.Commands.MarkAsRead;

public class MarkNotificationAsReadCommandHandler(
    INotificationRepository notificationRepository,
    ICurrentUserService currentUserService,
    IUnitOfWork unitOfWork
) : IRequestHandler<MarkNotificationAsReadCommand, Result<bool>>
{
    private readonly INotificationRepository _notificationRepository = notificationRepository;
    private readonly ICurrentUserService _currentUserService = currentUserService;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;

    public async Task<Result<bool>> Handle(
        MarkNotificationAsReadCommand request,
        CancellationToken cancellationToken
    )
    {
        var userId = _currentUserService.UserId;
        if (!userId.HasValue)
        {
            return Result<bool>.Unauthorized("Errors.UserNotAuthenticated");
        }

        var notification = await _notificationRepository.GetByIdAsync(
            request.NotificationId,
            cancellationToken
        );

        if (notification == null)
        {
            return Result<bool>.NotFound("Errors.NotificationNotFound");
        }

        if (notification.UserId != userId.Value)
        {
            return Result<bool>.Forbidden("Errors.NotificationAccessDenied");
        }

        notification.MarkAsRead();
        _notificationRepository.Update(notification);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
