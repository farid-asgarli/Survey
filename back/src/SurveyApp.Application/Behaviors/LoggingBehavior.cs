using System.Diagnostics;
using MediatR;
using Microsoft.Extensions.Logging;
using SurveyApp.Application.Common.Interfaces;

namespace SurveyApp.Application.Behaviors;

public class LoggingBehavior<TRequest, TResponse>(
    ILogger<LoggingBehavior<TRequest, TResponse>> logger,
    ICurrentUserService currentUserService
) : IPipelineBehavior<TRequest, TResponse>
    where TRequest : IRequest<TResponse>
{
    private readonly ILogger<LoggingBehavior<TRequest, TResponse>> _logger = logger;
    private readonly ICurrentUserService _currentUserService = currentUserService;

    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken
    )
    {
        var requestName = typeof(TRequest).Name;
        var userId = _currentUserService.UserId?.ToString() ?? "anonymous";

        _logger.LogInformation("Handling {RequestName} for user {UserId}", requestName, userId);

        var stopwatch = Stopwatch.StartNew();

        try
        {
            var response = await next();

            stopwatch.Stop();

            _logger.LogInformation(
                "Handled {RequestName} for user {UserId} in {ElapsedMilliseconds}ms",
                requestName,
                userId,
                stopwatch.ElapsedMilliseconds
            );

            return response;
        }
        catch (Exception ex)
        {
            stopwatch.Stop();

            _logger.LogError(
                ex,
                "Error handling {RequestName} for user {UserId} after {ElapsedMilliseconds}ms",
                requestName,
                userId,
                stopwatch.ElapsedMilliseconds
            );

            throw;
        }
    }
}
