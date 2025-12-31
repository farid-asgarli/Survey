namespace SurveyApp.Application.Services.Files;

/// <summary>
/// Configuration options for file validation.
/// </summary>
public class FileValidationOptions
{
    public const string SectionName = "FileValidation";

    /// <summary>
    /// Maximum file size in bytes (default: 5 MB).
    /// </summary>
    public long MaxFileSizeBytes { get; set; } = 5 * 1024 * 1024;

    /// <summary>
    /// Maximum number of files for bulk upload (default: 10).
    /// </summary>
    public int MaxBulkUploadFiles { get; set; } = 10;

    /// <summary>
    /// Allowed image MIME types.
    /// </summary>
    public HashSet<string> AllowedImageTypes { get; set; } =
    [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
        "image/svg+xml",
    ];

    /// <summary>
    /// Allowed image file extensions.
    /// </summary>
    public HashSet<string> AllowedImageExtensions { get; set; } =
    [
        ".jpg",
        ".jpeg",
        ".png",
        ".gif",
        ".webp",
        ".svg",
    ];
}
