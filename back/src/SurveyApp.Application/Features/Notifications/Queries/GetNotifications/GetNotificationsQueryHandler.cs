using System.Text.Json;
using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Application.DTOs.Common;
using SurveyApp.Domain.Interfaces;

namespace SurveyApp.Application.Features.Notifications.Queries.GetNotifications;

public class GetNotificationsQueryHandler(
    INotificationRepository notificationRepository,
    ICurrentUserService currentUserService
) : IRequestHandler<GetNotificationsQuery, Result<PagedResponse<NotificationDto>>>
{
    private readonly INotificationRepository _notificationRepository = notificationRepository;
    private readonly ICurrentUserService _currentUserService = currentUserService;

    public async Task<Result<PagedResponse<NotificationDto>>> Handle(
        GetNotificationsQuery request,
        CancellationToken cancellationToken
    )
    {
        var userId = _currentUserService.UserId;
        if (!userId.HasValue)
        {
            return Result<PagedResponse<NotificationDto>>.Unauthorized(
                "Errors.UserNotAuthenticated"
            );
        }

        var (notifications, totalCount) = await _notificationRepository.GetByUserIdPagedAsync(
            userId.Value,
            request.PageNumber,
            request.PageSize,
            request.IncludeRead,
            includeArchived: false,
            cancellationToken
        );

        var dtos = notifications
            .Select(n => new NotificationDto
            {
                Id = n.Id,
                Type = n.Type,
                Title = n.Title,
                Message = n.Message,
                ActionUrl = n.ActionUrl,
                ActionLabel = n.ActionLabel,
                IsRead = n.IsRead,
                ReadAt = n.ReadAt,
                RelatedEntityId = n.RelatedEntityId,
                RelatedEntityType = n.RelatedEntityType,
                Metadata = ParseMetadata(n.Metadata),
                CreatedAt = n.CreatedAt,
            })
            .ToList();

        var response = PagedResponse<NotificationDto>.Create(
            dtos,
            request.PageNumber,
            request.PageSize,
            totalCount
        );

        return Result<PagedResponse<NotificationDto>>.Success(response);
    }

    private static Dictionary<string, object>? ParseMetadata(string? json)
    {
        if (string.IsNullOrWhiteSpace(json))
            return null;

        try
        {
            return JsonSerializer.Deserialize<Dictionary<string, object>>(json);
        }
        catch
        {
            return null;
        }
    }
}
