using MediatR;
using SurveyApp.Application.Common;

namespace SurveyApp.Application.Features.Notifications.Commands.MarkAsRead;

public record MarkNotificationAsReadCommand(Guid NotificationId) : IRequest<Result<bool>>;
