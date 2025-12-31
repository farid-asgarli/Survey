using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Localization;
using SurveyApp.Application.Services;

namespace SurveyApp.API.Controllers;

/// <summary>
/// Controller for handling file uploads and downloads.
/// Supports images for survey customization (logos, backgrounds, etc.)
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class FilesController : ControllerBase
{
    private readonly IFileStorageService _fileStorageService;
    private readonly ILogger<FilesController> _logger;
    private readonly IStringLocalizer<FilesController> _localizer;

    // Allowed image MIME types
    private static readonly HashSet<string> AllowedImageTypes = new(
        StringComparer.OrdinalIgnoreCase
    )
    {
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
        "image/svg+xml",
    };

    // Allowed image extensions
    private static readonly HashSet<string> AllowedImageExtensions = new(
        StringComparer.OrdinalIgnoreCase
    )
    {
        ".jpg",
        ".jpeg",
        ".png",
        ".gif",
        ".webp",
        ".svg",
    };

    // File signature (magic bytes) validation to prevent polyglot attacks
    private static readonly Dictionary<string, byte[][]> FileSignatures = new(
        StringComparer.OrdinalIgnoreCase
    )
    {
        { ".jpg", new[] { new byte[] { 0xFF, 0xD8, 0xFF } } },
        { ".jpeg", new[] { new byte[] { 0xFF, 0xD8, 0xFF } } },
        { ".png", new[] { new byte[] { 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A } } },
        {
            ".gif",
            new[]
            {
                new byte[] { 0x47, 0x49, 0x46, 0x38, 0x37, 0x61 },
                new byte[] { 0x47, 0x49, 0x46, 0x38, 0x39, 0x61 },
            }
        }, // GIF87a and GIF89a
        { ".webp", new[] { new byte[] { 0x52, 0x49, 0x46, 0x46 } } }, // RIFF header (WebP also has WEBP at offset 8)
    };

    // Maximum file size (5 MB)
    private const long MaxFileSizeBytes = 5 * 1024 * 1024;

    // Maximum number of files for bulk upload
    private const int MaxBulkUploadFiles = 10;

    public FilesController(
        IFileStorageService fileStorageService,
        ILogger<FilesController> logger,
        IStringLocalizer<FilesController> localizer
    )
    {
        _fileStorageService = fileStorageService;
        _logger = logger;
        _localizer = localizer;
    }

    /// <summary>
    /// Upload an image file (for logos, backgrounds, etc.)
    /// </summary>
    /// <param name="file">The image file to upload</param>
    /// <param name="category">Optional category for organization (logo, background, question)</param>
    /// <returns>The uploaded file information including URL</returns>
    [HttpPost("images")]
    [ProducesResponseType(typeof(FileUploadResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status413PayloadTooLarge)]
    [RequestSizeLimit(MaxFileSizeBytes)]
    public async Task<IActionResult> UploadImage(
        IFormFile file,
        [FromQuery] string? category = null,
        CancellationToken cancellationToken = default
    )
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest(
                new ProblemDetails
                {
                    Title = _localizer["Errors.InvalidFile"],
                    Detail = _localizer["Errors.FileEmptyOrNotProvided"],
                    Status = StatusCodes.Status400BadRequest,
                }
            );
        }

        // Validate file size
        if (file.Length > MaxFileSizeBytes)
        {
            return StatusCode(
                StatusCodes.Status413PayloadTooLarge,
                new ProblemDetails
                {
                    Title = _localizer["Errors.FileTooLarge"],
                    Detail = string.Format(
                        _localizer["Errors.FileTooLargeDetail"],
                        MaxFileSizeBytes / (1024 * 1024)
                    ),
                    Status = StatusCodes.Status413PayloadTooLarge,
                }
            );
        }

        // Validate content type
        if (!AllowedImageTypes.Contains(file.ContentType))
        {
            return BadRequest(
                new ProblemDetails
                {
                    Title = _localizer["Errors.InvalidFileType"],
                    Detail = string.Format(
                        _localizer["Errors.InvalidFileTypeDetail"],
                        file.ContentType,
                        string.Join(", ", AllowedImageTypes)
                    ),
                    Status = StatusCodes.Status400BadRequest,
                }
            );
        }

        // Validate extension
        var extension = Path.GetExtension(file.FileName);
        if (!AllowedImageExtensions.Contains(extension))
        {
            return BadRequest(
                new ProblemDetails
                {
                    Title = _localizer["Errors.InvalidFileExtension"],
                    Detail = string.Format(
                        _localizer["Errors.InvalidFileExtensionDetail"],
                        extension,
                        string.Join(", ", AllowedImageExtensions)
                    ),
                    Status = StatusCodes.Status400BadRequest,
                }
            );
        }

        // Validate file content (magic bytes) to prevent polyglot attacks
        // Note: SVG files are XML-based and don't have magic bytes, so we skip this check for them
        // SVG files should be carefully sanitized to prevent XSS attacks
        if (!extension.Equals(".svg", StringComparison.OrdinalIgnoreCase))
        {
            var validationResult = await ValidateFileSignatureAsync(file, extension);
            if (!validationResult.IsValid)
            {
                return BadRequest(
                    new ProblemDetails
                    {
                        Title = _localizer["Errors.InvalidFileContent"],
                        Detail = _localizer["Errors.FileContentMismatch"],
                        Status = StatusCodes.Status400BadRequest,
                    }
                );
            }
        }
        else
        {
            // For SVG files, perform basic XSS validation
            var svgValidation = await ValidateSvgFileAsync(file);
            if (!svgValidation.IsValid)
            {
                return BadRequest(
                    new ProblemDetails
                    {
                        Title = _localizer["Errors.InvalidFileContent"],
                        Detail =
                            svgValidation.ErrorMessage
                            ?? _localizer["Errors.SvgContainsUnsafeContent"],
                        Status = StatusCodes.Status400BadRequest,
                    }
                );
            }
        }

        try
        {
            using var stream = file.OpenReadStream();

            // Generate a safe filename with category prefix if provided
            var safeFileName = GenerateSafeFileName(file.FileName, category);

            var fileId = await _fileStorageService.UploadFileAsync(
                stream,
                safeFileName,
                file.ContentType,
                cancellationToken
            );

            var fileUrl = _fileStorageService.GetFileUrl(fileId);

            _logger.LogInformation(
                "Image uploaded successfully: {FileId}, Original: {OriginalName}, Category: {Category}",
                fileId,
                file.FileName,
                category ?? "none"
            );

            return Ok(
                new FileUploadResponse
                {
                    FileId = fileId,
                    FileName = file.FileName,
                    Url = fileUrl,
                    ContentType = file.ContentType,
                    Size = file.Length,
                    Category = category,
                }
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to upload image: {FileName}", file.FileName);
            return StatusCode(
                StatusCodes.Status500InternalServerError,
                new ProblemDetails
                {
                    Title = _localizer["Errors.UploadFailed"],
                    Detail = _localizer["Errors.UploadErrorRetry"],
                    Status = StatusCodes.Status500InternalServerError,
                }
            );
        }
    }

    /// <summary>
    /// Upload multiple image files at once
    /// </summary>
    [HttpPost("images/bulk")]
    [ProducesResponseType(typeof(BulkFileUploadResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [RequestSizeLimit(MaxFileSizeBytes * 10)] // Allow up to 10 files
    public async Task<IActionResult> UploadImages(
        IFormFileCollection files,
        [FromQuery] string? category = null,
        CancellationToken cancellationToken = default
    )
    {
        if (files == null || files.Count == 0)
        {
            return BadRequest(
                new ProblemDetails
                {
                    Title = _localizer["Errors.NoFilesProvided"],
                    Detail = _localizer["Errors.AtLeastOneFileRequired"],
                    Status = StatusCodes.Status400BadRequest,
                }
            );
        }

        if (files.Count > MaxBulkUploadFiles)
        {
            return BadRequest(
                new ProblemDetails
                {
                    Title = _localizer["Errors.TooManyFiles"],
                    Detail = string.Format(
                        _localizer["Errors.MaxFilesUploadLimit"],
                        MaxBulkUploadFiles
                    ),
                    Status = StatusCodes.Status400BadRequest,
                }
            );
        }

        var results = new List<FileUploadResult>();

        foreach (var file in files)
        {
            try
            {
                // Validate each file
                if (file.Length == 0)
                {
                    results.Add(
                        new FileUploadResult
                        {
                            FileName = file.FileName,
                            Success = false,
                            Error = _localizer["Errors.FileEmpty"],
                        }
                    );
                    continue;
                }

                if (file.Length > MaxFileSizeBytes)
                {
                    results.Add(
                        new FileUploadResult
                        {
                            FileName = file.FileName,
                            Success = false,
                            Error = _localizer["Errors.FileTooLarge"],
                        }
                    );
                    continue;
                }

                if (!AllowedImageTypes.Contains(file.ContentType))
                {
                    results.Add(
                        new FileUploadResult
                        {
                            FileName = file.FileName,
                            Success = false,
                            Error = string.Format(
                                _localizer["Errors.InvalidFileTypeDetail"],
                                file.ContentType,
                                string.Join(", ", AllowedImageTypes)
                            ),
                        }
                    );
                    continue;
                }

                using var stream = file.OpenReadStream();
                var safeFileName = GenerateSafeFileName(file.FileName, category);

                var fileId = await _fileStorageService.UploadFileAsync(
                    stream,
                    safeFileName,
                    file.ContentType,
                    cancellationToken
                );

                results.Add(
                    new FileUploadResult
                    {
                        FileName = file.FileName,
                        Success = true,
                        FileId = fileId,
                        Url = _fileStorageService.GetFileUrl(fileId),
                        Size = file.Length,
                    }
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to upload file: {FileName}", file.FileName);
                results.Add(
                    new FileUploadResult
                    {
                        FileName = file.FileName,
                        Success = false,
                        Error = _localizer["Errors.UploadFailed"],
                    }
                );
            }
        }

        return Ok(
            new BulkFileUploadResponse
            {
                Results = results,
                SuccessCount = results.Count(r => r.Success),
                FailureCount = results.Count(r => !r.Success),
            }
        );
    }

    /// <summary>
    /// Get file information by ID
    /// </summary>
    [HttpGet("{fileId}")]
    [ProducesResponseType(typeof(Application.Services.FileInfo), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [AllowAnonymous] // Allow public access to files
    public async Task<IActionResult> GetFileInfo(
        string fileId,
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            var fileInfo = await _fileStorageService.GetFileInfoAsync(fileId, cancellationToken);
            return Ok(fileInfo);
        }
        catch (FileNotFoundException)
        {
            return NotFound(
                new ProblemDetails
                {
                    Title = _localizer["Errors.FileNotFound"],
                    Detail = string.Format(_localizer["Errors.FileNotFoundDetail"], fileId),
                    Status = StatusCodes.Status404NotFound,
                }
            );
        }
    }

    /// <summary>
    /// Download/serve a file by ID
    /// </summary>
    [HttpGet("{fileId}/download")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [AllowAnonymous] // Allow public access to files (for survey display)
    public async Task<IActionResult> DownloadFile(
        string fileId,
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            var fileInfo = await _fileStorageService.GetFileInfoAsync(fileId, cancellationToken);
            var stream = await _fileStorageService.DownloadFileAsync(fileId, cancellationToken);

            return File(stream, fileInfo.ContentType, fileInfo.FileName);
        }
        catch (FileNotFoundException)
        {
            return NotFound(
                new ProblemDetails
                {
                    Title = _localizer["Errors.FileNotFound"],
                    Detail = string.Format(_localizer["Errors.FileNotFoundDetail"], fileId),
                    Status = StatusCodes.Status404NotFound,
                }
            );
        }
    }

    /// <summary>
    /// Delete a file by ID
    /// </summary>
    [HttpDelete("{fileId}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteFile(
        string fileId,
        CancellationToken cancellationToken = default
    )
    {
        var deleted = await _fileStorageService.DeleteFileAsync(fileId, cancellationToken);

        if (!deleted)
        {
            return NotFound(
                new ProblemDetails
                {
                    Title = _localizer["Errors.FileNotFound"],
                    Detail = string.Format(_localizer["Errors.FileNotFoundDetail"], fileId),
                    Status = StatusCodes.Status404NotFound,
                }
            );
        }

        _logger.LogInformation("File deleted: {FileId}", fileId);
        return NoContent();
    }

    /// <summary>
    /// Generate a safe filename with optional category prefix
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
            .Concat(new[] { '/', '\\', ':', '.', ' ' })
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

    /// <summary>
    /// Validates file content by checking magic bytes (file signature)
    /// </summary>
    private static async Task<(bool IsValid, string? ErrorMessage)> ValidateFileSignatureAsync(
        IFormFile file,
        string extension
    )
    {
        if (!FileSignatures.TryGetValue(extension, out var signatures))
        {
            // No signature defined for this extension, skip validation
            return (true, null);
        }

        var maxSignatureLength = signatures.Max(s => s.Length);
        var headerBytes = new byte[maxSignatureLength];

        using var stream = file.OpenReadStream();
        var bytesRead = await stream.ReadAsync(headerBytes.AsMemory(0, maxSignatureLength));

        if (bytesRead < signatures.Min(s => s.Length))
        {
            return (false, "File is too small to be a valid image");
        }

        // Check if any of the valid signatures match
        foreach (var signature in signatures)
        {
            if (headerBytes.Take(signature.Length).SequenceEqual(signature))
            {
                // For WebP, also verify the WEBP identifier at offset 8
                if (extension.Equals(".webp", StringComparison.OrdinalIgnoreCase))
                {
                    if (bytesRead >= 12)
                    {
                        var webpIdentifier = new byte[] { 0x57, 0x45, 0x42, 0x50 }; // "WEBP"
                        if (headerBytes.Skip(8).Take(4).SequenceEqual(webpIdentifier))
                        {
                            return (true, null);
                        }
                    }
                    continue; // Try next signature if WebP verification failed
                }
                return (true, null);
            }
        }

        return (false, "File content does not match the expected format");
    }

    /// <summary>
    /// Validates SVG files for potential XSS attacks
    /// </summary>
    private static async Task<(bool IsValid, string? ErrorMessage)> ValidateSvgFileAsync(
        IFormFile file
    )
    {
        using var reader = new StreamReader(file.OpenReadStream());
        var content = await reader.ReadToEndAsync();

        // Check for potentially dangerous SVG content
        var dangerousPatterns = new[]
        {
            "<script",
            "javascript:",
            "on\\w+\\s*=", // onclick, onerror, onload, etc.
            "xlink:href\\s*=\\s*[\"']?javascript:",
            "<foreignObject",
            "data:text/html",
        };

        foreach (var pattern in dangerousPatterns)
        {
            if (
                System.Text.RegularExpressions.Regex.IsMatch(
                    content,
                    pattern,
                    System.Text.RegularExpressions.RegexOptions.IgnoreCase
                )
            )
            {
                return (false, "SVG file contains potentially unsafe content");
            }
        }

        // Basic XML validation - should start with XML declaration or SVG tag
        var trimmedContent = content.TrimStart();
        if (
            !trimmedContent.StartsWith("<?xml", StringComparison.OrdinalIgnoreCase)
            && !trimmedContent.StartsWith("<svg", StringComparison.OrdinalIgnoreCase)
        )
        {
            return (false, "File does not appear to be a valid SVG");
        }

        return (true, null);
    }
}

/// <summary>
/// Response model for single file upload
/// </summary>
public record FileUploadResponse
{
    public string FileId { get; init; } = string.Empty;
    public string FileName { get; init; } = string.Empty;
    public string Url { get; init; } = string.Empty;
    public string ContentType { get; init; } = string.Empty;
    public long Size { get; init; }
    public string? Category { get; init; }
}

/// <summary>
/// Response model for bulk file upload
/// </summary>
public record BulkFileUploadResponse
{
    public List<FileUploadResult> Results { get; init; } = new();
    public int SuccessCount { get; init; }
    public int FailureCount { get; init; }
}

/// <summary>
/// Result model for individual file in bulk upload
/// </summary>
public record FileUploadResult
{
    public string FileName { get; init; } = string.Empty;
    public bool Success { get; init; }
    public string? FileId { get; init; }
    public string? Url { get; init; }
    public long? Size { get; init; }
    public string? Error { get; init; }
}
