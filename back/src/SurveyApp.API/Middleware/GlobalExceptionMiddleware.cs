using System.Net;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Localization;
using SurveyApp.API.Constants;
using SurveyApp.Domain.Common;

namespace SurveyApp.API.Middleware;

/// <summary>
/// Global exception handling middleware.
/// Provides consistent error responses across all endpoints.
/// </summary>
/// <remarks>
/// Initializes a new instance of the middleware.
/// </remarks>
public class GlobalExceptionMiddleware(
    RequestDelegate next,
    ILogger<GlobalExceptionMiddleware> logger,
    IHostEnvironment environment,
    IStringLocalizer<GlobalExceptionMiddleware> localizer
)
{
    private readonly RequestDelegate _next = next;
    private readonly ILogger<GlobalExceptionMiddleware> _logger = logger;
    private readonly IHostEnvironment _environment = environment;
    private readonly IStringLocalizer<GlobalExceptionMiddleware> _localizer = localizer;

    /// <summary>
    /// Invokes the middleware.
    /// </summary>
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        _logger.LogError(
            exception,
            "Unhandled exception occurred. Request: {Method} {Path}",
            context.Request.Method,
            context.Request.Path
        );

        var (statusCode, problemDetails) = CreateProblemDetails(exception, context);

        context.Response.ContentType = "application/problem+json";
        context.Response.StatusCode = statusCode;

        var options = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        };

        await context.Response.WriteAsync(JsonSerializer.Serialize(problemDetails, options));
    }

    private (int StatusCode, ProblemDetails Details) CreateProblemDetails(
        Exception exception,
        HttpContext context
    )
    {
        var statusCode = exception switch
        {
            DomainException => (int)HttpStatusCode.BadRequest,
            ArgumentNullException => (int)HttpStatusCode.BadRequest,
            ArgumentException => (int)HttpStatusCode.BadRequest,
            UnauthorizedAccessException => (int)HttpStatusCode.Unauthorized,
            InvalidOperationException => (int)HttpStatusCode.Conflict,
            KeyNotFoundException => (int)HttpStatusCode.NotFound,
            NotImplementedException => (int)HttpStatusCode.NotImplemented,
            OperationCanceledException => 499, // Client Closed Request
            _ => (int)HttpStatusCode.InternalServerError,
        };

        var problemDetails = new ProblemDetails
        {
            Type = GetProblemType(statusCode),
            Title = GetTitle(statusCode),
            Status = statusCode,
            Instance = context.Request.Path,
        };

        // Include detailed error info in development
        if (_environment.IsDevelopment())
        {
            problemDetails.Detail = exception.Message;
            problemDetails.Extensions["stackTrace"] = exception.StackTrace;
            problemDetails.Extensions["exceptionType"] = exception.GetType().Name;

            if (exception.InnerException != null)
            {
                problemDetails.Extensions["innerException"] = exception.InnerException.Message;
            }
        }
        else
        {
            problemDetails.Detail =
                statusCode >= 500 ? _localizer["Errors.InternalServerError"] : exception.Message;
        }

        problemDetails.Extensions["traceId"] = context.TraceIdentifier;

        return (statusCode, problemDetails);
    }

    private static string GetProblemType(int statusCode) =>
        ProblemDetailsTypes.GetTypeForStatusCode(statusCode);

    private string GetTitle(int statusCode) =>
        statusCode switch
        {
            400 => _localizer["HttpStatus.BadRequest"],
            401 => _localizer["HttpStatus.Unauthorized"],
            403 => _localizer["HttpStatus.Forbidden"],
            404 => _localizer["HttpStatus.NotFound"],
            409 => _localizer["HttpStatus.Conflict"],
            500 => _localizer["HttpStatus.InternalServerError"],
            _ => _localizer["Errors.ErrorOccurred"],
        };
}

/// <summary>
/// Extension methods for registering the global exception middleware.
/// </summary>
public static class GlobalExceptionMiddlewareExtensions
{
    /// <summary>
    /// Adds global exception handling middleware to the pipeline.
    /// </summary>
    public static IApplicationBuilder UseGlobalExceptionHandler(this IApplicationBuilder app)
    {
        return app.UseMiddleware<GlobalExceptionMiddleware>();
    }
}
