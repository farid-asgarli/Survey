using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.DTOs;
using SurveyApp.Application.DTOs.Common;

namespace SurveyApp.Application.Features.Notifications.Queries.GetNotifications;

public record GetNotificationsQuery : IRequest<Result<PagedResponse<NotificationDto>>>
{
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 20;
    public bool IncludeRead { get; init; } = true;
}
