using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Localization;
using SurveyApp.Application.Common;

namespace SurveyApp.API.Extensions;

/// <summary>
/// Extensions for converting Result objects to ProblemDetails responses.
/// </summary>
public static class ResultExtensions
{
    /// <summary>
    /// Localizes an error message using the IStringLocalizer.
    /// If the error looks like a localization key (e.g., "Handler.NamespaceContextRequired"),
    /// it will be translated. Otherwise, the original message is returned.
    /// </summary>
    private static string LocalizeError(HttpContext context, string? error)
    {
        if (string.IsNullOrEmpty(error))
            return error ?? string.Empty;

        var localizer = context.RequestServices.GetService<IStringLocalizer>();
        if (localizer == null)
            return error;

        var localized = localizer[error];
        return localized.ResourceNotFound ? error : localized.Value;
    }

    /// <summary>
    /// Creates a BadRequest ProblemDetails for ID mismatch validation errors.
    /// Use this when the ID in the route doesn't match the ID in the request body.
    /// </summary>
    /// <param name="context">The HTTP context.</param>
    /// <param name="detailKey">The localization key for the detail message (default: "Errors.IdMismatch").</param>
    /// <returns>A BadRequest result with ProblemDetails.</returns>
    public static IActionResult IdMismatchProblem(
        this HttpContext context,
        string detailKey = "Errors.IdMismatch"
    )
    {
        var problemDetails = new ProblemDetails
        {
            Type = "https://tools.ietf.org/html/rfc7231#section-6.5.1",
            Title = LocalizeError(context, "Errors.BadRequest"),
            Status = StatusCodes.Status400BadRequest,
            Detail = LocalizeError(context, detailKey),
            Instance = context.Request.Path,
        };

        return new BadRequestObjectResult(problemDetails);
    }

    /// <summary>
    /// Creates an Unauthorized ProblemDetails response.
    /// </summary>
    /// <param name="context">The HTTP context.</param>
    /// <param name="titleKey">The localization key for the title.</param>
    /// <param name="detailKey">The localization key for the detail message.</param>
    /// <returns>An Unauthorized result with ProblemDetails.</returns>
    public static IActionResult UnauthorizedProblem(
        this HttpContext context,
        string titleKey = "Errors.AuthenticationFailed",
        string? detailKey = null
    )
    {
        var problemDetails = new ProblemDetails
        {
            Type = "https://tools.ietf.org/html/rfc7231#section-6.5.1",
            Title = LocalizeError(context, titleKey),
            Status = StatusCodes.Status401Unauthorized,
            Detail = detailKey != null ? LocalizeError(context, detailKey) : null,
            Instance = context.Request.Path,
        };

        return new UnauthorizedObjectResult(problemDetails);
    }

    /// <summary>
    /// Creates a BadRequest ProblemDetails response with a custom message.
    /// </summary>
    /// <param name="context">The HTTP context.</param>
    /// <param name="titleKey">The localization key for the title.</param>
    /// <param name="detailKey">The localization key for the detail message.</param>
    /// <returns>A BadRequest result with ProblemDetails.</returns>
    public static IActionResult BadRequestProblem(
        this HttpContext context,
        string titleKey = "Errors.BadRequest",
        string? detailKey = null
    )
    {
        var problemDetails = new ProblemDetails
        {
            Type = "https://tools.ietf.org/html/rfc7231#section-6.5.1",
            Title = LocalizeError(context, titleKey),
            Status = StatusCodes.Status400BadRequest,
            Detail = detailKey != null ? LocalizeError(context, detailKey) : null,
            Instance = context.Request.Path,
        };

        return new BadRequestObjectResult(problemDetails);
    }

    /// <summary>
    /// Converts a failed Result to an appropriate ProblemDetails response.
    /// </summary>
    public static IActionResult ToProblemDetails<T>(this Result<T> result, HttpContext context)
    {
        if (result.IsSuccess)
            throw new InvalidOperationException(
                "Cannot convert a successful result to ProblemDetails."
            );

        return result.ErrorCode switch
        {
            "NOT_FOUND" => CreateNotFoundProblem(result, context),
            "UNAUTHORIZED" => CreateUnauthorizedProblem(result, context),
            "FORBIDDEN" => CreateForbiddenProblem(result, context),
            "VALIDATION_ERROR" => CreateValidationProblem(result, context),
            _ => CreateBadRequestProblem(result, context),
        };
    }

    /// <summary>
    /// Converts a failed non-generic Result to an appropriate ProblemDetails response.
    /// </summary>
    public static IActionResult ToProblemDetails(this Result result, HttpContext context)
    {
        if (result.IsSuccess)
            throw new InvalidOperationException(
                "Cannot convert a successful result to ProblemDetails."
            );

        return result.ErrorCode switch
        {
            "NOT_FOUND" => CreateNotFoundProblem(result, context),
            "UNAUTHORIZED" => CreateUnauthorizedProblem(result, context),
            "FORBIDDEN" => CreateForbiddenProblem(result, context),
            "VALIDATION_ERROR" => CreateValidationProblem(result, context),
            _ => CreateBadRequestProblem(result, context),
        };
    }

    private static NotFoundObjectResult CreateNotFoundProblem<T>(
        Result<T> result,
        HttpContext context
    )
    {
        var problemDetails = new ProblemDetails
        {
            Type = "https://tools.ietf.org/html/rfc7231#section-6.5.4",
            Title = LocalizeError(context, "Errors.ResourceNotFound"),
            Status = StatusCodes.Status404NotFound,
            Detail = LocalizeError(context, result.Error),
            Instance = context.Request.Path,
        };

        return new NotFoundObjectResult(problemDetails);
    }

    private static NotFoundObjectResult CreateNotFoundProblem(Result result, HttpContext context)
    {
        var problemDetails = new ProblemDetails
        {
            Type = "https://tools.ietf.org/html/rfc7231#section-6.5.4",
            Title = LocalizeError(context, "Errors.ResourceNotFound"),
            Status = StatusCodes.Status404NotFound,
            Detail = LocalizeError(context, result.Error),
            Instance = context.Request.Path,
        };

        return new NotFoundObjectResult(problemDetails);
    }

    private static UnauthorizedObjectResult CreateUnauthorizedProblem<T>(
        Result<T> result,
        HttpContext context
    )
    {
        var problemDetails = new ProblemDetails
        {
            Type = "https://tools.ietf.org/html/rfc7231#section-6.5.1",
            Title = "Unauthorized.",
            Status = StatusCodes.Status401Unauthorized,
            Detail = LocalizeError(context, result.Error),
            Instance = context.Request.Path,
        };

        return new UnauthorizedObjectResult(problemDetails);
    }

    private static UnauthorizedObjectResult CreateUnauthorizedProblem(
        Result result,
        HttpContext context
    )
    {
        var problemDetails = new ProblemDetails
        {
            Type = "https://tools.ietf.org/html/rfc7231#section-6.5.1",
            Title = "Unauthorized.",
            Status = StatusCodes.Status401Unauthorized,
            Detail = LocalizeError(context, result.Error),
            Instance = context.Request.Path,
        };

        return new UnauthorizedObjectResult(problemDetails);
    }

    private static ObjectResult CreateForbiddenProblem<T>(Result<T> result, HttpContext context)
    {
        var problemDetails = new ProblemDetails
        {
            Type = "https://tools.ietf.org/html/rfc7231#section-6.5.3",
            Title = "Access denied.",
            Status = StatusCodes.Status403Forbidden,
            Detail = LocalizeError(context, result.Error),
            Instance = context.Request.Path,
        };

        return new ObjectResult(problemDetails) { StatusCode = StatusCodes.Status403Forbidden };
    }

    private static ObjectResult CreateForbiddenProblem(Result result, HttpContext context)
    {
        var problemDetails = new ProblemDetails
        {
            Type = "https://tools.ietf.org/html/rfc7231#section-6.5.3",
            Title = "Access denied.",
            Status = StatusCodes.Status403Forbidden,
            Detail = LocalizeError(context, result.Error),
            Instance = context.Request.Path,
        };

        return new ObjectResult(problemDetails) { StatusCode = StatusCodes.Status403Forbidden };
    }

    private static BadRequestObjectResult CreateValidationProblem<T>(
        Result<T> result,
        HttpContext context
    )
    {
        var problemDetails = new ValidationProblemDetails(
            result.ValidationErrors?.ToDictionary(x => x.Key, x => x.Value) ?? []
        )
        {
            Type = "https://tools.ietf.org/html/rfc7231#section-6.5.1",
            Title = "One or more validation errors occurred.",
            Status = StatusCodes.Status400BadRequest,
            Detail = LocalizeError(context, result.Error),
            Instance = context.Request.Path,
        };

        return new BadRequestObjectResult(problemDetails);
    }

    private static BadRequestObjectResult CreateValidationProblem(
        Result result,
        HttpContext context
    )
    {
        var problemDetails = new ValidationProblemDetails(
            result.ValidationErrors?.ToDictionary(x => x.Key, x => x.Value) ?? []
        )
        {
            Type = "https://tools.ietf.org/html/rfc7231#section-6.5.1",
            Title = "One or more validation errors occurred.",
            Status = StatusCodes.Status400BadRequest,
            Detail = LocalizeError(context, result.Error),
            Instance = context.Request.Path,
        };

        return new BadRequestObjectResult(problemDetails);
    }

    private static BadRequestObjectResult CreateBadRequestProblem<T>(
        Result<T> result,
        HttpContext context
    )
    {
        var problemDetails = new ProblemDetails
        {
            Type = "https://tools.ietf.org/html/rfc7231#section-6.5.1",
            Title = "Bad request.",
            Status = StatusCodes.Status400BadRequest,
            Detail = LocalizeError(context, result.Error),
            Instance = context.Request.Path,
        };

        if (result.ValidationErrors != null && result.ValidationErrors.Count > 0)
        {
            problemDetails.Extensions["errors"] = result.ValidationErrors;
        }

        return new BadRequestObjectResult(problemDetails);
    }

    private static BadRequestObjectResult CreateBadRequestProblem(
        Result result,
        HttpContext context
    )
    {
        var problemDetails = new ProblemDetails
        {
            Type = "https://tools.ietf.org/html/rfc7231#section-6.5.1",
            Title = "Bad request.",
            Status = StatusCodes.Status400BadRequest,
            Detail = LocalizeError(context, result.Error),
            Instance = context.Request.Path,
        };

        if (result.ValidationErrors != null && result.ValidationErrors.Count > 0)
        {
            problemDetails.Extensions["errors"] = result.ValidationErrors;
        }

        return new BadRequestObjectResult(problemDetails);
    }
}
