using MediatR;
using Microsoft.Extensions.Logging;
using SurveyApp.Application.Common.Interfaces;

namespace SurveyApp.Application.Behaviors;

public class AuditBehavior<TRequest, TResponse>(
    ILogger<AuditBehavior<TRequest, TResponse>> logger,
    ICurrentUserService currentUserService,
    IDateTimeService dateTimeService
) : IPipelineBehavior<TRequest, TResponse>
    where TRequest : IRequest<TResponse>
{
    private readonly ILogger<AuditBehavior<TRequest, TResponse>> _logger = logger;
    private readonly ICurrentUserService _currentUserService = currentUserService;
    private readonly IDateTimeService _dateTimeService = dateTimeService;

    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken
    )
    {
        var requestName = typeof(TRequest).Name;
        var userId = _currentUserService.UserId?.ToString() ?? "anonymous";
        var timestamp = _dateTimeService.UtcNow;

        // Log audit entry for commands (write operations)
        if (requestName.EndsWith("Command"))
        {
            _logger.LogInformation(
                "Audit: {Action} by {UserId} at {Timestamp} - Request: {RequestName}",
                GetActionFromRequest(requestName),
                userId,
                timestamp,
                requestName
            );
        }

        var response = await next();

        // Log successful completion for commands
        if (requestName.EndsWith("Command"))
        {
            _logger.LogInformation(
                "Audit: {Action} completed by {UserId} at {Timestamp}",
                GetActionFromRequest(requestName),
                userId,
                _dateTimeService.UtcNow
            );
        }

        return response;
    }

    private static string GetActionFromRequest(string requestName)
    {
        // Remove "Command" suffix and convert to action name
        var action = requestName.Replace("Command", string.Empty);

        // Insert spaces before capital letters
        return string.Concat(
            action.Select((c, i) => i > 0 && char.IsUpper(c) ? " " + c : c.ToString())
        );
    }
}
