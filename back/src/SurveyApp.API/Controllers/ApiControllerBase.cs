using Microsoft.AspNetCore.Mvc;
using SurveyApp.API.Extensions;
using SurveyApp.Application.Common;

namespace SurveyApp.API.Controllers;

/// <summary>
/// Base controller providing common functionality for all API controllers.
/// </summary>
[ApiController]
public abstract class ApiControllerBase : ControllerBase
{
    /// <summary>
    /// Creates an appropriate ActionResult based on the Result pattern.
    /// </summary>
    /// <typeparam name="T">The type of value in the result.</typeparam>
    /// <param name="result">The result to convert.</param>
    /// <returns>An IActionResult appropriate for the result state.</returns>
    protected IActionResult HandleResult<T>(Result<T> result)
    {
        if (result.IsSuccess)
        {
            return Ok(result.Value);
        }

        return result.ToProblemDetails(HttpContext);
    }

    /// <summary>
    /// Creates an appropriate ActionResult for a successful creation with location header.
    /// </summary>
    /// <typeparam name="T">The type of value in the result.</typeparam>
    /// <param name="result">The result to convert.</param>
    /// <param name="actionName">The action name for the location header.</param>
    /// <param name="routeValues">Route values for the location header.</param>
    /// <returns>An IActionResult appropriate for the result state.</returns>
    protected IActionResult HandleCreatedResult<T>(
        Result<T> result,
        string actionName,
        object? routeValues = null
    )
    {
        if (result.IsSuccess)
        {
            return CreatedAtAction(actionName, routeValues, result.Value);
        }

        return result.ToProblemDetails(HttpContext);
    }

    /// <summary>
    /// Creates an appropriate ActionResult for a successful creation with location header,
    /// using a function to generate route values from the result value.
    /// </summary>
    /// <typeparam name="T">The type of value in the result.</typeparam>
    /// <param name="result">The result to convert.</param>
    /// <param name="actionName">The action name for the location header.</param>
    /// <param name="routeValuesFactory">Function to generate route values from the result value.</param>
    /// <returns>An IActionResult appropriate for the result state.</returns>
    protected IActionResult HandleCreatedResult<T>(
        Result<T> result,
        string actionName,
        Func<T, object> routeValuesFactory
    )
    {
        if (result.IsSuccess && result.Value != null)
        {
            return CreatedAtAction(actionName, routeValuesFactory(result.Value), result.Value);
        }

        return result.ToProblemDetails(HttpContext);
    }

    /// <summary>
    /// Creates a NoContent result for successful operations that don't return data.
    /// </summary>
    /// <param name="result">The result to check.</param>
    /// <returns>NoContent if successful, otherwise ProblemDetails.</returns>
    protected IActionResult HandleNoContentResult<T>(Result<T> result)
    {
        if (result.IsSuccess)
        {
            return NoContent();
        }

        return result.ToProblemDetails(HttpContext);
    }

    /// <summary>
    /// Creates an ID mismatch error response.
    /// </summary>
    /// <param name="detailKey">The localization key for the detail message.</param>
    /// <returns>A BadRequest result with ProblemDetails.</returns>
    protected IActionResult IdMismatchError(string detailKey = "Errors.IdMismatchUrlBody")
    {
        return HttpContext.IdMismatchProblem(detailKey);
    }

    /// <summary>
    /// Validates that two IDs match. Returns a BadRequest if they don't.
    /// </summary>
    /// <param name="routeId">The ID from the route.</param>
    /// <param name="bodyId">The ID from the request body.</param>
    /// <param name="detailKey">The localization key for the error detail.</param>
    /// <returns>Null if IDs match, or a BadRequest result if they don't.</returns>
    protected IActionResult? ValidateIdMatch(
        Guid routeId,
        Guid bodyId,
        string detailKey = "Errors.IdMismatchUrlBody"
    )
    {
        if (routeId != bodyId)
        {
            return IdMismatchError(detailKey);
        }
        return null;
    }

    /// <summary>
    /// Creates a File result for downloads.
    /// </summary>
    /// <typeparam name="T">The type containing file data.</typeparam>
    /// <param name="result">The result containing file data.</param>
    /// <param name="getData">Function to get byte array from result value.</param>
    /// <param name="getContentType">Function to get content type from result value.</param>
    /// <param name="getFileName">Function to get file name from result value.</param>
    /// <returns>A File result if successful, otherwise ProblemDetails.</returns>
    protected IActionResult HandleFileResult<T>(
        Result<T> result,
        Func<T, byte[]> getData,
        Func<T, string> getContentType,
        Func<T, string> getFileName
    )
    {
        if (result.IsSuccess && result.Value != null)
        {
            return File(
                getData(result.Value),
                getContentType(result.Value),
                getFileName(result.Value)
            );
        }

        return result.ToProblemDetails(HttpContext);
    }

    /// <summary>
    /// Creates a File result for stream-based downloads.
    /// </summary>
    /// <typeparam name="T">The type containing file data.</typeparam>
    /// <param name="result">The result containing file data.</param>
    /// <param name="getStream">Function to get stream from result value.</param>
    /// <param name="getContentType">Function to get content type from result value.</param>
    /// <param name="getFileName">Function to get file name from result value.</param>
    /// <returns>A File result if successful, otherwise ProblemDetails.</returns>
    protected IActionResult HandleStreamFileResult<T>(
        Result<T> result,
        Func<T, Stream> getStream,
        Func<T, string> getContentType,
        Func<T, string> getFileName
    )
    {
        if (result.IsSuccess && result.Value != null)
        {
            return File(
                getStream(result.Value),
                getContentType(result.Value),
                getFileName(result.Value)
            );
        }

        return result.ToProblemDetails(HttpContext);
    }
}
