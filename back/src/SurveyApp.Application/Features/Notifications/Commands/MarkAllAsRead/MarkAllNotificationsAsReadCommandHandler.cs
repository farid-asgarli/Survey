using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Domain.Interfaces;

namespace SurveyApp.Application.Features.Notifications.Commands.MarkAllAsRead;

public class MarkAllNotificationsAsReadCommandHandler(
    INotificationRepository notificationRepository,
    ICurrentUserService currentUserService
) : IRequestHandler<MarkAllNotificationsAsReadCommand, Result<bool>>
{
    private readonly INotificationRepository _notificationRepository = notificationRepository;
    private readonly ICurrentUserService _currentUserService = currentUserService;

    public async Task<Result<bool>> Handle(
        MarkAllNotificationsAsReadCommand request,
        CancellationToken cancellationToken
    )
    {
        var userId = _currentUserService.UserId;
        if (!userId.HasValue)
        {
            return Result<bool>.Unauthorized("Errors.UserNotAuthenticated");
        }

        await _notificationRepository.MarkAllAsReadAsync(userId.Value, cancellationToken);

        return Result<bool>.Success(true);
    }
}
