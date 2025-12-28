using System.Diagnostics;
using MediatR;
using Microsoft.Extensions.Logging;

namespace SurveyApp.Application.Behaviors;

public class PerformanceBehavior<TRequest, TResponse>(
    ILogger<PerformanceBehavior<TRequest, TResponse>> logger
) : IPipelineBehavior<TRequest, TResponse>
    where TRequest : IRequest<TResponse>
{
    private readonly ILogger<PerformanceBehavior<TRequest, TResponse>> _logger = logger;
    private readonly Stopwatch _timer = new Stopwatch();

    // Threshold in milliseconds for logging slow requests
    private const int SlowRequestThreshold = 500;

    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken
    )
    {
        _timer.Start();

        var response = await next();

        _timer.Stop();

        var elapsedMilliseconds = _timer.ElapsedMilliseconds;

        if (elapsedMilliseconds > SlowRequestThreshold)
        {
            var requestName = typeof(TRequest).Name;

            _logger.LogWarning(
                "Long running request: {RequestName} ({ElapsedMilliseconds}ms)",
                requestName,
                elapsedMilliseconds
            );
        }

        return response;
    }
}
