namespace SurveyApp.Application.Services.Files;

/// <summary>
/// Service for validating file uploads with security checks.
/// </summary>
public interface IFileValidationService
{
    /// <summary>
    /// Validates a file for upload including size, type, extension, and content checks.
    /// </summary>
    /// <param name="fileStream">The file stream to validate.</param>
    /// <param name="fileName">The original file name.</param>
    /// <param name="contentType">The content type of the file.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Validation result with any errors.</returns>
    Task<FileValidationResult> ValidateImageFileAsync(
        Stream fileStream,
        string fileName,
        string contentType,
        long fileSize,
        CancellationToken cancellationToken = default
    );
}

/// <summary>
/// Result of file validation operation.
/// </summary>
public record FileValidationResult
{
    public bool IsValid { get; init; }
    public string? ErrorTitle { get; init; }
    public string? ErrorDetail { get; init; }
    public FileValidationErrorType? ErrorType { get; init; }

    public static FileValidationResult Success() => new() { IsValid = true };

    public static FileValidationResult Failure(
        FileValidationErrorType errorType,
        string title,
        string detail
    ) =>
        new()
        {
            IsValid = false,
            ErrorType = errorType,
            ErrorTitle = title,
            ErrorDetail = detail,
        };
}

/// <summary>
/// Types of validation errors for file uploads.
/// </summary>
public enum FileValidationErrorType
{
    EmptyFile,
    FileTooLarge,
    InvalidContentType,
    InvalidExtension,
    InvalidFileContent,
    UnsafeSvgContent,
    InvalidSvgFormat,
}
