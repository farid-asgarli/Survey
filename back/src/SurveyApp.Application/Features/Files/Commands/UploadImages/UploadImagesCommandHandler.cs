using MediatR;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using SurveyApp.Application.Common;
using SurveyApp.Application.DTOs;
using SurveyApp.Application.Services;
using SurveyApp.Application.Services.Files;

namespace SurveyApp.Application.Features.Files.Commands.UploadImages;

public class UploadImagesCommandHandler(
    IFileStorageService fileStorageService,
    IFileValidationService fileValidationService,
    IOptions<FileValidationOptions> options,
    ILogger<UploadImagesCommandHandler> logger
) : IRequestHandler<UploadImagesCommand, Result<BulkFileUploadResponseDto>>
{
    private readonly IFileStorageService _fileStorageService = fileStorageService;
    private readonly IFileValidationService _fileValidationService = fileValidationService;
    private readonly FileValidationOptions _options = options.Value;
    private readonly ILogger<UploadImagesCommandHandler> _logger = logger;

    public async Task<Result<BulkFileUploadResponseDto>> Handle(
        UploadImagesCommand request,
        CancellationToken cancellationToken
    )
    {
        if (request.Files.Count == 0)
        {
            return Result<BulkFileUploadResponseDto>.Failure(
                "Errors.AtLeastOneFileRequired",
                "VALIDATION_ERROR"
            );
        }

        if (request.Files.Count > _options.MaxBulkUploadFiles)
        {
            return Result<BulkFileUploadResponseDto>.Failure(
                $"Errors.MaxFilesUploadLimit:{_options.MaxBulkUploadFiles}",
                "VALIDATION_ERROR"
            );
        }

        var results = new List<FileUploadResultDto>();

        foreach (var file in request.Files)
        {
            try
            {
                // Validate each file
                var validationResult = await _fileValidationService.ValidateImageFileAsync(
                    file.FileStream,
                    file.FileName,
                    file.ContentType,
                    file.FileSize,
                    cancellationToken
                );

                if (!validationResult.IsValid)
                {
                    results.Add(
                        new FileUploadResultDto
                        {
                            FileName = file.FileName,
                            Success = false,
                            Error = validationResult.ErrorDetail ?? validationResult.ErrorTitle,
                        }
                    );
                    continue;
                }

                // Reset stream position before upload
                if (file.FileStream.CanSeek)
                {
                    file.FileStream.Position = 0;
                }

                var safeFileName = GenerateSafeFileName(file.FileName, request.Category);

                var fileId = await _fileStorageService.UploadFileAsync(
                    file.FileStream,
                    safeFileName,
                    file.ContentType,
                    cancellationToken
                );

                results.Add(
                    new FileUploadResultDto
                    {
                        FileName = file.FileName,
                        Success = true,
                        FileId = fileId,
                        Url = _fileStorageService.GetFileUrl(fileId),
                        Size = file.FileSize,
                    }
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to upload file: {FileName}", file.FileName);
                results.Add(
                    new FileUploadResultDto
                    {
                        FileName = file.FileName,
                        Success = false,
                        Error = "Errors.UploadFailed",
                    }
                );
            }
        }

        return Result<BulkFileUploadResponseDto>.Success(
            new BulkFileUploadResponseDto
            {
                Results = results,
                SuccessCount = results.Count(r => r.Success),
                FailureCount = results.Count(r => !r.Success),
            }
        );
    }

    private static string GenerateSafeFileName(string originalFileName, string? category)
    {
        var extension = Path.GetExtension(originalFileName);
        var baseName = Path.GetFileNameWithoutExtension(originalFileName);
        var safeBaseName = string.Join("_", baseName.Split(Path.GetInvalidFileNameChars()));

        if (safeBaseName.Length > 50)
        {
            safeBaseName = safeBaseName[..50];
        }

        if (!string.IsNullOrEmpty(category))
        {
            var safeCategory = SanitizeCategory(category);
            return $"{safeCategory}_{safeBaseName}{extension}";
        }

        return $"{safeBaseName}{extension}";
    }

    private static string SanitizeCategory(string category)
    {
        if (string.IsNullOrEmpty(category))
        {
            return string.Empty;
        }

        var invalidChars = Path.GetInvalidFileNameChars()
            .Concat(['/', '\\', ':', '.', ' '])
            .ToArray();

        var sanitized = string.Join(
            "_",
            category.Split(invalidChars, StringSplitOptions.RemoveEmptyEntries)
        );

        sanitized = new string(
            [.. sanitized.Where(c => char.IsLetterOrDigit(c) || c == '-' || c == '_')]
        );

        if (sanitized.Length > 30)
        {
            sanitized = sanitized[..30];
        }

        return sanitized;
    }
}
