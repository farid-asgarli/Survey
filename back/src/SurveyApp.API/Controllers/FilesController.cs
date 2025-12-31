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

        // Add category prefix if provided
        if (!string.IsNullOrEmpty(category))
        {
            return $"{category}_{safeBaseName}{extension}";
        }

        return $"{safeBaseName}{extension}";
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
