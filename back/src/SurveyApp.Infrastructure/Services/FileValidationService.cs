using System.Text.RegularExpressions;
using Microsoft.Extensions.Options;
using SurveyApp.Application.Services.Files;

namespace SurveyApp.Infrastructure.Services;

/// <summary>
/// Service for validating file uploads with security checks.
/// </summary>
public partial class FileValidationService(IOptions<FileValidationOptions> options)
    : IFileValidationService
{
    private readonly FileValidationOptions _options = options.Value;

    // File signature (magic bytes) validation to prevent polyglot attacks
    private static readonly Dictionary<string, byte[][]> FileSignatures = new(
        StringComparer.OrdinalIgnoreCase
    )
    {
        { ".jpg", [new byte[] { 0xFF, 0xD8, 0xFF }] },
        { ".jpeg", [new byte[] { 0xFF, 0xD8, 0xFF }] },
        { ".png", [new byte[] { 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A }] },
        { ".gif", ["GIF87a"u8.ToArray(), "GIF89a"u8.ToArray()] }, // GIF87a and GIF89a
        { ".webp", ["RIFF"u8.ToArray()] }, // RIFF header (WebP also has WEBP at offset 8)
    };

    // Dangerous SVG patterns that could be used for XSS attacks
    private static readonly string[] DangerousSvgPatterns =
    [
        "<script",
        "javascript:",
        @"on\w+\s*=", // onclick, onerror, onload, etc.
        @"xlink:href\s*=\s*[""']?javascript:",
        "<foreignObject",
        "data:text/html",
    ];

    /// <inheritdoc />
    public async Task<FileValidationResult> ValidateImageFileAsync(
        Stream fileStream,
        string fileName,
        string contentType,
        long fileSize,
        CancellationToken cancellationToken = default
    )
    {
        // Validate file is not empty
        if (fileSize == 0)
        {
            return FileValidationResult.Failure(
                FileValidationErrorType.EmptyFile,
                "Errors.InvalidFile",
                "Errors.FileEmptyOrNotProvided"
            );
        }

        // Validate file size
        if (fileSize > _options.MaxFileSizeBytes)
        {
            return FileValidationResult.Failure(
                FileValidationErrorType.FileTooLarge,
                "Errors.FileTooLarge",
                $"Errors.FileTooLargeDetail:{_options.MaxFileSizeBytes / (1024 * 1024)}"
            );
        }

        // Validate content type
        if (!_options.AllowedImageTypes.Contains(contentType))
        {
            return FileValidationResult.Failure(
                FileValidationErrorType.InvalidContentType,
                "Errors.InvalidFileType",
                $"Errors.InvalidFileTypeDetail:{contentType}:{string.Join(", ", _options.AllowedImageTypes)}"
            );
        }

        // Validate extension
        var extension = Path.GetExtension(fileName);
        if (!_options.AllowedImageExtensions.Contains(extension))
        {
            return FileValidationResult.Failure(
                FileValidationErrorType.InvalidExtension,
                "Errors.InvalidFileExtension",
                $"Errors.InvalidFileExtensionDetail:{extension}:{string.Join(", ", _options.AllowedImageExtensions)}"
            );
        }

        // Validate file content (magic bytes) to prevent polyglot attacks
        // Note: SVG files are XML-based and don't have magic bytes, so we skip this check for them
        if (!extension.Equals(".svg", StringComparison.OrdinalIgnoreCase))
        {
            var signatureResult = await ValidateFileSignatureAsync(
                fileStream,
                extension,
                cancellationToken
            );
            if (!signatureResult.IsValid)
            {
                return signatureResult;
            }
        }
        else
        {
            // For SVG files, perform basic XSS validation
            var svgResult = await ValidateSvgFileAsync(fileStream, cancellationToken);
            if (!svgResult.IsValid)
            {
                return svgResult;
            }
        }

        return FileValidationResult.Success();
    }

    /// <summary>
    /// Validates file content by checking magic bytes (file signature).
    /// </summary>
    private static async Task<FileValidationResult> ValidateFileSignatureAsync(
        Stream fileStream,
        string extension,
        CancellationToken cancellationToken
    )
    {
        if (!FileSignatures.TryGetValue(extension, out var signatures))
        {
            // No signature defined for this extension, skip validation
            return FileValidationResult.Success();
        }

        var maxSignatureLength = signatures.Max(s => s.Length);
        var headerBytes = new byte[maxSignatureLength];

        // Save position and read from beginning
        var originalPosition = fileStream.Position;
        fileStream.Position = 0;

        var bytesRead = await fileStream.ReadAsync(
            headerBytes.AsMemory(0, maxSignatureLength),
            cancellationToken
        );

        // Restore position
        fileStream.Position = originalPosition;

        if (bytesRead < signatures.Min(s => s.Length))
        {
            return FileValidationResult.Failure(
                FileValidationErrorType.InvalidFileContent,
                "Errors.InvalidFileContent",
                "Errors.FileTooSmallForImage"
            );
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
                        var webpIdentifier = "WEBP"u8.ToArray(); // "WEBP"
                        if (headerBytes.Skip(8).Take(4).SequenceEqual(webpIdentifier))
                        {
                            return FileValidationResult.Success();
                        }
                    }
                    continue; // Try next signature if WebP verification failed
                }
                return FileValidationResult.Success();
            }
        }

        return FileValidationResult.Failure(
            FileValidationErrorType.InvalidFileContent,
            "Errors.InvalidFileContent",
            "Errors.FileContentMismatch"
        );
    }

    /// <summary>
    /// Validates SVG files for potential XSS attacks.
    /// </summary>
    private static async Task<FileValidationResult> ValidateSvgFileAsync(
        Stream fileStream,
        CancellationToken cancellationToken
    )
    {
        // Save position and read from beginning
        var originalPosition = fileStream.Position;
        fileStream.Position = 0;

        using var reader = new StreamReader(fileStream, leaveOpen: true);
        var content = await reader.ReadToEndAsync(cancellationToken);

        // Restore position
        fileStream.Position = originalPosition;

        // Check for potentially dangerous SVG content
        foreach (var pattern in DangerousSvgPatterns)
        {
            if (Regex.IsMatch(content, pattern, RegexOptions.IgnoreCase))
            {
                return FileValidationResult.Failure(
                    FileValidationErrorType.UnsafeSvgContent,
                    "Errors.InvalidFileContent",
                    "Errors.SvgContainsUnsafeContent"
                );
            }
        }

        // Basic XML validation - should start with XML declaration or SVG tag
        var trimmedContent = content.TrimStart();
        if (
            !trimmedContent.StartsWith("<?xml", StringComparison.OrdinalIgnoreCase)
            && !trimmedContent.StartsWith("<svg", StringComparison.OrdinalIgnoreCase)
        )
        {
            return FileValidationResult.Failure(
                FileValidationErrorType.InvalidSvgFormat,
                "Errors.InvalidFileContent",
                "Errors.InvalidSvgFormat"
            );
        }

        return FileValidationResult.Success();
    }
}
