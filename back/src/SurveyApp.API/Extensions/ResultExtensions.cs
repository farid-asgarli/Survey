using Microsoft.AspNetCore.Mvc;
using SurveyApp.Application.Common;

namespace SurveyApp.API.Extensions;

/// <summary>
/// Extensions for converting Result objects to ProblemDetails responses.
/// </summary>
public static class ResultExtensions
{
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
            _ => CreateBadRequestProblem(result, context)
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
            _ => CreateBadRequestProblem(result, context)
        };
    }

    private static ObjectResult CreateNotFoundProblem<T>(Result<T> result, HttpContext context)
    {
        var problemDetails = new ProblemDetails
        {
            Type = "https://tools.ietf.org/html/rfc7231#section-6.5.4",
            Title = "Resource not found.",
            Status = StatusCodes.Status404NotFound,
            Detail = result.Error,
            Instance = context.Request.Path
        };

        return new NotFoundObjectResult(problemDetails);
    }

    private static ObjectResult CreateNotFoundProblem(Result result, HttpContext context)
    {
        var problemDetails = new ProblemDetails
        {
            Type = "https://tools.ietf.org/html/rfc7231#section-6.5.4",
            Title = "Resource not found.",
            Status = StatusCodes.Status404NotFound,
            Detail = result.Error,
            Instance = context.Request.Path
        };

        return new NotFoundObjectResult(problemDetails);
    }

    private static ObjectResult CreateUnauthorizedProblem<T>(Result<T> result, HttpContext context)
    {
        var problemDetails = new ProblemDetails
        {
            Type = "https://tools.ietf.org/html/rfc7231#section-6.5.1",
            Title = "Unauthorized.",
            Status = StatusCodes.Status401Unauthorized,
            Detail = result.Error,
            Instance = context.Request.Path
        };

        return new UnauthorizedObjectResult(problemDetails);
    }

    private static ObjectResult CreateUnauthorizedProblem(Result result, HttpContext context)
    {
        var problemDetails = new ProblemDetails
        {
            Type = "https://tools.ietf.org/html/rfc7231#section-6.5.1",
            Title = "Unauthorized.",
            Status = StatusCodes.Status401Unauthorized,
            Detail = result.Error,
            Instance = context.Request.Path
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
            Detail = result.Error,
            Instance = context.Request.Path
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
            Detail = result.Error,
            Instance = context.Request.Path
        };

        return new ObjectResult(problemDetails) { StatusCode = StatusCodes.Status403Forbidden };
    }

    private static ObjectResult CreateValidationProblem<T>(Result<T> result, HttpContext context)
    {
        var problemDetails = new ValidationProblemDetails(
            result.ValidationErrors?.ToDictionary(x => x.Key, x => x.Value)
                ?? new Dictionary<string, string[]>()
        )
        {
            Type = "https://tools.ietf.org/html/rfc7231#section-6.5.1",
            Title = "One or more validation errors occurred.",
            Status = StatusCodes.Status400BadRequest,
            Detail = result.Error,
            Instance = context.Request.Path
        };

        return new BadRequestObjectResult(problemDetails);
    }

    private static ObjectResult CreateValidationProblem(Result result, HttpContext context)
    {
        var problemDetails = new ValidationProblemDetails(
            result.ValidationErrors?.ToDictionary(x => x.Key, x => x.Value)
                ?? new Dictionary<string, string[]>()
        )
        {
            Type = "https://tools.ietf.org/html/rfc7231#section-6.5.1",
            Title = "One or more validation errors occurred.",
            Status = StatusCodes.Status400BadRequest,
            Detail = result.Error,
            Instance = context.Request.Path
        };

        return new BadRequestObjectResult(problemDetails);
    }

    private static ObjectResult CreateBadRequestProblem<T>(Result<T> result, HttpContext context)
    {
        var problemDetails = new ProblemDetails
        {
            Type = "https://tools.ietf.org/html/rfc7231#section-6.5.1",
            Title = "Bad request.",
            Status = StatusCodes.Status400BadRequest,
            Detail = result.Error,
            Instance = context.Request.Path
        };

        if (result.ValidationErrors != null && result.ValidationErrors.Count > 0)
        {
            problemDetails.Extensions["errors"] = result.ValidationErrors;
        }

        return new BadRequestObjectResult(problemDetails);
    }

    private static ObjectResult CreateBadRequestProblem(Result result, HttpContext context)
    {
        var problemDetails = new ProblemDetails
        {
            Type = "https://tools.ietf.org/html/rfc7231#section-6.5.1",
            Title = "Bad request.",
            Status = StatusCodes.Status400BadRequest,
            Detail = result.Error,
            Instance = context.Request.Path
        };

        if (result.ValidationErrors != null && result.ValidationErrors.Count > 0)
        {
            problemDetails.Extensions["errors"] = result.ValidationErrors;
        }

        return new BadRequestObjectResult(problemDetails);
    }
}
