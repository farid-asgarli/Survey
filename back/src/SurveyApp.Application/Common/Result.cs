namespace SurveyApp.Application.Common;

/// <summary>
/// Represents the result of an operation that may succeed or fail.
/// </summary>
/// <typeparam name="T">The type of the value on success.</typeparam>
public class Result<T>
{
    /// <summary>
    /// Gets whether the operation was successful.
    /// </summary>
    public bool IsSuccess { get; }

    /// <summary>
    /// Gets whether the operation failed.
    /// </summary>
    public bool IsFailure => !IsSuccess;

    /// <summary>
    /// Gets the value if the operation was successful.
    /// </summary>
    public T? Value { get; }

    /// <summary>
    /// Gets the error message if the operation failed.
    /// </summary>
    public string? Error { get; }

    /// <summary>
    /// Gets the error code if the operation failed.
    /// </summary>
    public string? ErrorCode { get; }

    /// <summary>
    /// Gets the validation errors if the operation failed due to validation.
    /// </summary>
    public IReadOnlyDictionary<string, string[]>? ValidationErrors { get; }

    private Result(
        bool isSuccess,
        T? value,
        string? error,
        string? errorCode,
        IReadOnlyDictionary<string, string[]>? validationErrors
    )
    {
        IsSuccess = isSuccess;
        Value = value;
        Error = error;
        ErrorCode = errorCode;
        ValidationErrors = validationErrors;
    }

    /// <summary>
    /// Creates a successful result.
    /// </summary>
    public static Result<T> Success(T value)
    {
        return new Result<T>(true, value, null, null, null);
    }

    /// <summary>
    /// Creates a failed result.
    /// </summary>
    public static Result<T> Failure(string error, string? errorCode = null)
    {
        return new Result<T>(false, default, error, errorCode, null);
    }

    /// <summary>
    /// Creates a failed result with validation errors.
    /// </summary>
    public static Result<T> ValidationFailure(IDictionary<string, string[]> validationErrors)
    {
        return new Result<T>(
            false,
            default,
            "Errors.ValidationFailed",
            "VALIDATION_ERROR",
            new Dictionary<string, string[]>(validationErrors)
        );
    }

    /// <summary>
    /// Creates a failed result with validation error messages.
    /// </summary>
    public static Result<T> ValidationFailure(string[] errors)
    {
        var validationErrors = new Dictionary<string, string[]> { { "", errors } };
        return new Result<T>(
            false,
            default,
            errors.FirstOrDefault() ?? "Errors.ValidationFailed",
            "VALIDATION_ERROR",
            validationErrors
        );
    }

    /// <summary>
    /// Creates a not found result.
    /// </summary>
    public static Result<T> NotFound(string message = "Errors.ResourceNotFound")
    {
        return new Result<T>(false, default, message, "NOT_FOUND", null);
    }

    /// <summary>
    /// Creates an unauthorized result.
    /// </summary>
    public static Result<T> Unauthorized(string message = "Errors.UnauthorizedAccess")
    {
        return new Result<T>(false, default, message, "UNAUTHORIZED", null);
    }

    /// <summary>
    /// Creates a forbidden result.
    /// </summary>
    public static Result<T> Forbidden(string message = "Errors.AccessForbidden")
    {
        return new Result<T>(false, default, message, "FORBIDDEN", null);
    }

    /// <summary>
    /// Implicitly converts a value to a successful result.
    /// </summary>
    public static implicit operator Result<T>(T value) => Success(value);
}

/// <summary>
/// Represents the result of an operation that may succeed or fail without a value.
/// </summary>
public class Result
{
    /// <summary>
    /// Gets whether the operation was successful.
    /// </summary>
    public bool IsSuccess { get; }

    /// <summary>
    /// Gets whether the operation failed.
    /// </summary>
    public bool IsFailure => !IsSuccess;

    /// <summary>
    /// Gets the error message if the operation failed.
    /// </summary>
    public string? Error { get; }

    /// <summary>
    /// Gets the error code if the operation failed.
    /// </summary>
    public string? ErrorCode { get; }

    /// <summary>
    /// Gets the validation errors if the operation failed due to validation.
    /// </summary>
    public IReadOnlyDictionary<string, string[]>? ValidationErrors { get; }

    private Result(
        bool isSuccess,
        string? error,
        string? errorCode,
        IReadOnlyDictionary<string, string[]>? validationErrors
    )
    {
        IsSuccess = isSuccess;
        Error = error;
        ErrorCode = errorCode;
        ValidationErrors = validationErrors;
    }

    /// <summary>
    /// Creates a successful result.
    /// </summary>
    public static Result Success()
    {
        return new Result(true, null, null, null);
    }

    /// <summary>
    /// Creates a failed result.
    /// </summary>
    public static Result Failure(string error, string? errorCode = null)
    {
        return new Result(false, error, errorCode, null);
    }

    /// <summary>
    /// Creates a failed result with validation errors.
    /// </summary>
    public static Result ValidationFailure(IDictionary<string, string[]> validationErrors)
    {
        return new Result(
            false,
            "Errors.ValidationFailed",
            "VALIDATION_ERROR",
            new Dictionary<string, string[]>(validationErrors)
        );
    }

    /// <summary>
    /// Creates a not found result.
    /// </summary>
    public static Result NotFound(string message = "Errors.ResourceNotFound")
    {
        return new Result(false, message, "NOT_FOUND", null);
    }

    /// <summary>
    /// Creates an unauthorized result.
    /// </summary>
    public static Result Unauthorized(string message = "Errors.UnauthorizedAccess")
    {
        return new Result(false, message, "UNAUTHORIZED", null);
    }
}
