using System.Net;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Localization;
using SurveyApp.Application.Common.Exceptions;
using SurveyApp.Domain.Common;

namespace SurveyApp.API.Middleware;

public class ExceptionHandlingMiddleware(
    RequestDelegate next,
    ILogger<ExceptionHandlingMiddleware> logger,
    IStringLocalizer<ExceptionHandlingMiddleware> localizer
)
{
    private readonly RequestDelegate _next = next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger = logger;
    private readonly IStringLocalizer<ExceptionHandlingMiddleware> _localizer = localizer;

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
        var problemDetails = CreateProblemDetails(context, exception);

        context.Response.StatusCode =
            problemDetails.Status ?? (int)HttpStatusCode.InternalServerError;
        context.Response.ContentType = "application/problem+json";

        await context.Response.WriteAsJsonAsync(problemDetails);
    }

    private ProblemDetails CreateProblemDetails(HttpContext context, Exception exception)
    {
        return exception switch
        {
            DomainException domainException => new ProblemDetails
            {
                Type = "https://tools.ietf.org/html/rfc7231#section-6.5.1",
                Title = _localizer["Errors.BusinessRuleViolation"],
                Status = (int)HttpStatusCode.BadRequest,
                Detail =
                    domainException.FormatArgs?.Length > 0
                        ? string.Format(
                            _localizer[domainException.ResourceKey],
                            domainException.FormatArgs
                        )
                        : _localizer[domainException.ResourceKey],
                Instance = context.Request.Path,
            },

            ValidationException validationException => new ValidationProblemDetails(
                validationException.Errors
            )
            {
                Type = "https://tools.ietf.org/html/rfc7231#section-6.5.1",
                Title = _localizer["Errors.ValidationErrors"],
                Status = (int)HttpStatusCode.BadRequest,
                Instance = context.Request.Path,
            },

            NotFoundException notFoundException => new ProblemDetails
            {
                Type = "https://tools.ietf.org/html/rfc7231#section-6.5.4",
                Title = _localizer["Errors.ResourceNotFound"],
                Status = (int)HttpStatusCode.NotFound,
                Detail = LocalizeMessage(notFoundException.Message),
                Instance = context.Request.Path,
            },

            ForbiddenAccessException => new ProblemDetails
            {
                Type = "https://tools.ietf.org/html/rfc7231#section-6.5.3",
                Title = _localizer["Errors.AccessDenied"],
                Status = (int)HttpStatusCode.Forbidden,
                Detail = _localizer["Errors.PermissionDenied"],
                Instance = context.Request.Path,
            },

            NamespaceException namespaceException => new ProblemDetails
            {
                Type = "https://tools.ietf.org/html/rfc7231#section-6.5.1",
                Title = _localizer["Errors.NamespaceError"],
                Status = (int)HttpStatusCode.BadRequest,
                Detail = LocalizeMessage(namespaceException.Message),
                Instance = context.Request.Path,
            },

            UnauthorizedAccessException => new ProblemDetails
            {
                Type = "https://tools.ietf.org/html/rfc7231#section-6.5.1",
                Title = _localizer["Errors.Unauthorized"],
                Status = (int)HttpStatusCode.Unauthorized,
                Detail = _localizer["Errors.AuthenticationRequired"],
                Instance = context.Request.Path,
            },

            _ => CreateInternalServerError(context, exception),
        };
    }

    private string LocalizeMessage(string message)
    {
        if (string.IsNullOrWhiteSpace(message))
        {
            return message;
        }

        var (key, args) = ParseLocalizationKey(message);

        // Localize nested args if they themselves look like keys.
        var localizedArgs = args.Select(a =>
                a is string s ? (object)LocalizeKeyOrText(s) : a ?? string.Empty
            )
            .ToArray();

        var localized =
            localizedArgs.Length > 0 ? _localizer[key, localizedArgs!] : _localizer[key];
        return localized.ResourceNotFound ? message : localized.Value;
    }

    private string LocalizeKeyOrText(string text)
    {
        var (key, args) = ParseLocalizationKey(text);
        var localized = args.Length > 0 ? _localizer[key, args!] : _localizer[key];
        return localized.ResourceNotFound ? text : localized.Value;
    }

    private static (string Key, object[] Args) ParseLocalizationKey(string text)
    {
        var parts = text.Split('|', StringSplitOptions.None);
        if (parts.Length <= 1)
        {
            return (text, []);
        }

        var key = parts[0];
        if (string.IsNullOrWhiteSpace(key))
        {
            return (text, []);
        }

        var args = new object[parts.Length - 1];
        for (var i = 1; i < parts.Length; i++)
        {
            args[i - 1] = parts[i];
        }

        return (key, args);
    }

    private ProblemDetails CreateInternalServerError(HttpContext context, Exception exception)
    {
        _logger.LogError(exception, "An unhandled exception occurred");

        var problemDetails = new ProblemDetails
        {
            Type = "https://tools.ietf.org/html/rfc7231#section-6.6.1",
            Title = _localizer["Errors.InternalError"],
            Status = (int)HttpStatusCode.InternalServerError,
            Detail = _localizer["Errors.UnexpectedError"],
            Instance = context.Request.Path,
        };

#if DEBUG
        problemDetails.Extensions["exception"] = exception.ToString();
#endif

        return problemDetails;
    }
}

public static class ExceptionHandlingMiddlewareExtensions
{
    public static IApplicationBuilder UseExceptionHandling(this IApplicationBuilder builder)
    {
        return builder.UseMiddleware<ExceptionHandlingMiddleware>();
    }
}
