using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Domain.Interfaces;

namespace SurveyApp.Application.Features.Notifications.Queries.GetUnreadCount;

public class GetUnreadCountQueryHandler(
    INotificationRepository notificationRepository,
    ICurrentUserService currentUserService
) : IRequestHandler<GetUnreadCountQuery, Result<NotificationCountDto>>
{
    private readonly INotificationRepository _notificationRepository = notificationRepository;
    private readonly ICurrentUserService _currentUserService = currentUserService;

    public async Task<Result<NotificationCountDto>> Handle(
        GetUnreadCountQuery request,
        CancellationToken cancellationToken
    )
    {
        var userId = _currentUserService.UserId;
        if (!userId.HasValue)
        {
            return Result<NotificationCountDto>.Unauthorized("Errors.UserNotAuthenticated");
        }

        var unreadCount = await _notificationRepository.GetUnreadCountAsync(
            userId.Value,
            cancellationToken
        );

        return Result<NotificationCountDto>.Success(
            new NotificationCountDto
            {
                UnreadCount = unreadCount,
                TotalCount = unreadCount, // For now, just return unread count
            }
        );
    }
}
