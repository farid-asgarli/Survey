using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SurveyApp.Application.DTOs;
using SurveyApp.Application.DTOs.Common;
using SurveyApp.Application.Features.Notifications.Commands.MarkAllAsRead;
using SurveyApp.Application.Features.Notifications.Commands.MarkAsRead;
using SurveyApp.Application.Features.Notifications.Queries.GetNotifications;
using SurveyApp.Application.Features.Notifications.Queries.GetUnreadCount;

namespace SurveyApp.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NotificationsController(IMediator mediator) : ApiControllerBase
{
    private readonly IMediator _mediator = mediator;

    /// <summary>
    /// Get paginated notifications for the current user.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(PagedResponse<NotificationDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetNotifications(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] bool includeRead = true
    )
    {
        var query = new GetNotificationsQuery
        {
            PageNumber = pageNumber,
            PageSize = pageSize,
            IncludeRead = includeRead,
        };

        var result = await _mediator.Send(query);
        return HandleResult(result);
    }

    /// <summary>
    /// Get unread notification count for the current user.
    /// </summary>
    [HttpGet("unread-count")]
    [ProducesResponseType(typeof(NotificationCountDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetUnreadCount()
    {
        var result = await _mediator.Send(new GetUnreadCountQuery());
        return HandleResult(result);
    }

    /// <summary>
    /// Mark a single notification as read.
    /// </summary>
    [HttpPost("{id:guid}/read")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> MarkAsRead(Guid id)
    {
        var result = await _mediator.Send(new MarkNotificationAsReadCommand(id));
        return result.IsSuccess ? NoContent() : HandleResult(result);
    }

    /// <summary>
    /// Mark all notifications as read for the current user.
    /// </summary>
    [HttpPost("read-all")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> MarkAllAsRead()
    {
        var result = await _mediator.Send(new MarkAllNotificationsAsReadCommand());
        return result.IsSuccess ? NoContent() : HandleResult(result);
    }
}
