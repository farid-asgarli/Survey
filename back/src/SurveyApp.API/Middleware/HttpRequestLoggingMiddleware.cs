using System.Diagnostics;

namespace SurveyApp.API.Middleware;

/// <summary>
/// Middleware for logging HTTP request and response information.
/// Provides consistent request/response logging across all endpoints.
/// </summary>
/// <remarks>
/// Initializes a new instance of the middleware.
/// </remarks>
public class HttpRequestLoggingMiddleware(
    RequestDelegate next,
    ILogger<HttpRequestLoggingMiddleware> logger
)
{
    private readonly RequestDelegate _next = next;
    private readonly ILogger<HttpRequestLoggingMiddleware> _logger = logger;

    /// <summary>
    /// Invokes the middleware.
    /// </summary>
    public async Task InvokeAsync(HttpContext context)
    {
        var stopwatch = Stopwatch.StartNew();
        var requestId = context.TraceIdentifier;

        // Log request
        _logger.LogInformation(
            "Request {RequestId} started: {Method} {Path} from {RemoteIp}",
            requestId,
            context.Request.Method,
            context.Request.Path,
            context.Connection.RemoteIpAddress
        );

        try
        {
            await _next(context);
        }
        finally
        {
            stopwatch.Stop();

            // Log response
            var logLevel =
                context.Response.StatusCode >= 500 ? LogLevel.Error
                : context.Response.StatusCode >= 400 ? LogLevel.Warning
                : LogLevel.Information;

            _logger.Log(
                logLevel,
                "Request {RequestId} completed: {Method} {Path} - {StatusCode} in {ElapsedMs}ms",
                requestId,
                context.Request.Method,
                context.Request.Path,
                context.Response.StatusCode,
                stopwatch.ElapsedMilliseconds
            );
        }
    }
}

/// <summary>
/// Extension methods for registering the HTTP request logging middleware.
/// </summary>
public static class HttpRequestLoggingMiddlewareExtensions
{
    /// <summary>
    /// Adds HTTP request logging middleware to the pipeline.
    /// </summary>
    public static IApplicationBuilder UseHttpRequestLogging(this IApplicationBuilder app)
    {
        return app.UseMiddleware<HttpRequestLoggingMiddleware>();
    }
}
