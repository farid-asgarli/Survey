using MediatR;
using SurveyApp.Application.Common;

namespace SurveyApp.Application.Features.Notifications.Commands.MarkAllAsRead;

public record MarkAllNotificationsAsReadCommand : IRequest<Result<bool>>;
