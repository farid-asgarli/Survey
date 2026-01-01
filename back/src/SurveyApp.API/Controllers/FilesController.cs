using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Localization;
using Microsoft.Extensions.Options;
using SurveyApp.Application.DTOs;
using SurveyApp.Application.Features.Files.Commands.DeleteFile;
using SurveyApp.Application.Features.Files.Commands.UploadImage;
using SurveyApp.Application.Features.Files.Commands.UploadImages;
using SurveyApp.Application.Features.Files.Queries.DownloadFile;
using SurveyApp.Application.Features.Files.Queries.GetFileInfo;
using SurveyApp.Application.Services.Files;

namespace SurveyApp.API.Controllers;

/// <summary>
/// Controller for handling file uploads and downloads.
/// Supports images for survey customization (logos, backgrounds, etc.)
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class FilesController(
    IMediator mediator,
    IOptions<FileValidationOptions> options,
    IStringLocalizer<FilesController> localizer
) : ApiControllerBase
{
    private readonly IMediator _mediator = mediator;
    private readonly FileValidationOptions _options = options.Value;
    private readonly IStringLocalizer<FilesController> _localizer = localizer;

    /// <summary>
    /// Upload an image file (for logos, backgrounds, etc.)
    /// </summary>
    /// <param name="file">The image file to upload</param>
    /// <param name="category">Optional category for organization (logo, background, question)</param>
    /// <returns>The uploaded file information including URL</returns>
    [HttpPost("images")]
    [ProducesResponseType(typeof(FileUploadResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status413PayloadTooLarge)]
    [DisableRequestSizeLimit] // Limit is enforced via options
    public async Task<IActionResult> UploadImage(
        IFormFile file,
        [FromQuery] string? category = null,
        CancellationToken cancellationToken = default
    )
    {
        var validationError = ValidateFile(file);
        if (validationError != null)
            return validationError;

        await using var stream = file.OpenReadStream();

        var result = await _mediator.Send(
            new UploadImageCommand
            {
                FileStream = stream,
                FileName = file.FileName,
                ContentType = file.ContentType,
                FileSize = file.Length,
                Category = category,
            },
            cancellationToken
        );

        return HandleResult(result);
    }

    /// <summary>
    /// Upload multiple image files at once
    /// </summary>
    [HttpPost("images/bulk")]
    [ProducesResponseType(typeof(BulkFileUploadResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [DisableRequestSizeLimit] // Limit is enforced via options
    public async Task<IActionResult> UploadImages(
        IFormFileCollection files,
        [FromQuery] string? category = null,
        CancellationToken cancellationToken = default
    )
    {
        var validationError = ValidateFiles(files);
        if (validationError != null)
            return validationError;

        // Create file upload items from form files
        var uploadItems = new List<FileUploadItem>();
        var streams = new List<Stream>();

        try
        {
            foreach (var file in files)
            {
                var stream = file.OpenReadStream();
                streams.Add(stream); // Track for disposal

                uploadItems.Add(
                    new FileUploadItem
                    {
                        FileStream = stream,
                        FileName = file.FileName,
                        ContentType = file.ContentType,
                        FileSize = file.Length,
                    }
                );
            }

            var result = await _mediator.Send(
                new UploadImagesCommand { Files = uploadItems, Category = category },
                cancellationToken
            );

            return HandleResult(result);
        }
        finally
        {
            // Dispose all streams
            foreach (var stream in streams)
            {
                await stream.DisposeAsync();
            }
        }
    }

    /// <summary>
    /// Get file information by ID
    /// </summary>
    [HttpGet("{fileId}")]
    [ProducesResponseType(typeof(FileInfoDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [AllowAnonymous] // Allow public access to files
    public async Task<IActionResult> GetFileInfo(
        string fileId,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _mediator.Send(new GetFileInfoQuery(fileId), cancellationToken);

        return HandleResult(result);
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
        var result = await _mediator.Send(new DownloadFileQuery(fileId), cancellationToken);

        return HandleStreamFileResult(result, v => v.Stream, v => v.ContentType, v => v.FileName);
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
        var result = await _mediator.Send(new DeleteFileCommand(fileId), cancellationToken);

        return HandleNoContentResult(result);
    }

    #region Private Validation Methods

    private IActionResult? ValidateFile(IFormFile? file)
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

        if (file.Length > _options.MaxFileSizeBytes)
        {
            return StatusCode(
                StatusCodes.Status413PayloadTooLarge,
                new ProblemDetails
                {
                    Title = _localizer["Errors.FileTooLarge"],
                    Detail = _localizer[
                        "Errors.FileTooLargeDetail",
                        _options.MaxFileSizeBytes / (1024 * 1024)
                    ],
                    Status = StatusCodes.Status413PayloadTooLarge,
                }
            );
        }

        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!_options.AllowedImageExtensions.Contains(extension))
        {
            return BadRequest(
                new ProblemDetails
                {
                    Title = _localizer["Errors.InvalidFileType"],
                    Detail = _localizer[
                        "Errors.AllowedExtensions",
                        string.Join(", ", _options.AllowedImageExtensions)
                    ],
                    Status = StatusCodes.Status400BadRequest,
                }
            );
        }

        if (!_options.AllowedImageTypes.Contains(file.ContentType))
        {
            return BadRequest(
                new ProblemDetails
                {
                    Title = _localizer["Errors.InvalidContentType"],
                    Detail = _localizer[
                        "Errors.AllowedContentTypes",
                        string.Join(", ", _options.AllowedImageTypes)
                    ],
                    Status = StatusCodes.Status400BadRequest,
                }
            );
        }

        return null;
    }

    private IActionResult? ValidateFiles(IFormFileCollection? files)
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

        if (files.Count > _options.MaxBulkUploadFiles)
        {
            return BadRequest(
                new ProblemDetails
                {
                    Title = _localizer["Errors.TooManyFiles"],
                    Detail = _localizer["Errors.MaxFilesAllowed", _options.MaxBulkUploadFiles],
                    Status = StatusCodes.Status400BadRequest,
                }
            );
        }

        foreach (var file in files)
        {
            var validationError = ValidateFile(file);
            if (validationError != null)
                return validationError;
        }

        return null;
    }

    #endregion
}
