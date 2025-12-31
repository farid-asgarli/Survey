using MediatR;
using Microsoft.Extensions.Logging;
using SurveyApp.Application.Common;
using SurveyApp.Application.DTOs;
using SurveyApp.Application.Services;
using SurveyApp.Application.Services.Files;

namespace SurveyApp.Application.Features.Files.Commands.UploadImage;

public class UploadImageCommandHandler(
    IFileStorageService fileStorageService,
    IFileValidationService fileValidationService,
    ILogger<UploadImageCommandHandler> logger
) : IRequestHandler<UploadImageCommand, Result<FileUploadResponseDto>>
{
    private readonly IFileStorageService _fileStorageService = fileStorageService;
    private readonly IFileValidationService _fileValidationService = fileValidationService;
    private readonly ILogger<UploadImageCommandHandler> _logger = logger;

    public async Task<Result<FileUploadResponseDto>> Handle(
        UploadImageCommand request,
        CancellationToken cancellationToken
    )
    {
        // Validate the file
        var validationResult = await _fileValidationService.ValidateImageFileAsync(
            request.FileStream,
            request.FileName,
            request.ContentType,
            request.FileSize,
            cancellationToken
        );

        if (!validationResult.IsValid)
        {
            var errorCode = validationResult.ErrorType switch
            {
                FileValidationErrorType.FileTooLarge => "FILE_TOO_LARGE",
                _ => "VALIDATION_ERROR",
            };

            return Result<FileUploadResponseDto>.Failure(
                validationResult.ErrorDetail ?? validationResult.ErrorTitle!,
                errorCode
            );
        }

        try
        {
            // Reset stream position before upload
            if (request.FileStream.CanSeek)
            {
                request.FileStream.Position = 0;
            }

            // Generate a safe filename with category prefix if provided
            var safeFileName = GenerateSafeFileName(request.FileName, request.Category);

            var fileId = await _fileStorageService.UploadFileAsync(
                request.FileStream,
                safeFileName,
                request.ContentType,
                cancellationToken
            );

            var fileUrl = _fileStorageService.GetFileUrl(fileId);

            _logger.LogInformation(
                "Image uploaded successfully: {FileId}, Original: {OriginalName}, Category: {Category}",
                fileId,
                request.FileName,
                request.Category ?? "none"
            );

            return Result<FileUploadResponseDto>.Success(
                new FileUploadResponseDto
                {
                    FileId = fileId,
                    FileName = request.FileName,
                    Url = fileUrl,
                    ContentType = request.ContentType,
                    Size = request.FileSize,
                    Category = request.Category,
                }
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to upload image: {FileName}", request.FileName);
            return Result<FileUploadResponseDto>.Failure("Errors.UploadErrorRetry");
        }
    }

    /// <summary>
    /// Generate a safe filename with optional category prefix.
    /// </summary>
    private static string GenerateSafeFileName(string originalFileName, string? category)
    {
        var extension = Path.GetExtension(originalFileName);
        var baseName = Path.GetFileNameWithoutExtension(originalFileName);

        // Sanitize the base name
        var safeBaseName = string.Join("_", baseName.Split(Path.GetInvalidFileNameChars()));

        // Truncate if too long
        if (safeBaseName.Length > 50)
        {
            safeBaseName = safeBaseName[..50];
        }

        // Add category prefix if provided (sanitized to prevent path traversal)
        if (!string.IsNullOrEmpty(category))
        {
            var safeCategory = SanitizeCategory(category);
            return $"{safeCategory}_{safeBaseName}{extension}";
        }

        return $"{safeBaseName}{extension}";
    }

    /// <summary>
    /// Sanitizes the category parameter to prevent path traversal attacks.
    /// Only allows alphanumeric characters, hyphens, and underscores.
    /// </summary>
    private static string SanitizeCategory(string category)
    {
        if (string.IsNullOrEmpty(category))
        {
            return string.Empty;
        }

        // Remove any path separators and invalid characters
        var invalidChars = Path.GetInvalidFileNameChars()
            .Concat(['/', '\\', ':', '.', ' '])
            .ToArray();

        var sanitized = string.Join(
            "_",
            category.Split(invalidChars, StringSplitOptions.RemoveEmptyEntries)
        );

        // Only allow alphanumeric, hyphen, and underscore
        sanitized = new string(
            sanitized.Where(c => char.IsLetterOrDigit(c) || c == '-' || c == '_').ToArray()
        );

        // Limit length
        if (sanitized.Length > 30)
        {
            sanitized = sanitized[..30];
        }

        return sanitized;
    }
}
