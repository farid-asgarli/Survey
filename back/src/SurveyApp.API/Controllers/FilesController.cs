using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SurveyApp.Application.DTOs;
using SurveyApp.Application.Features.Files.Commands.DeleteFile;
using SurveyApp.Application.Features.Files.Commands.UploadImage;
using SurveyApp.Application.Features.Files.Commands.UploadImages;
using SurveyApp.Application.Features.Files.Queries.DownloadFile;
using SurveyApp.Application.Features.Files.Queries.GetFileInfo;

namespace SurveyApp.API.Controllers;

/// <summary>
/// Controller for handling file uploads and downloads.
/// Supports images for survey customization (logos, backgrounds, etc.)
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class FilesController(IMediator mediator) : ApiControllerBase
{
    private readonly IMediator _mediator = mediator;

    /// <summary>
    /// Upload an image file (for logos, backgrounds, etc.)
    /// </summary>
    /// <param name="file">The image file to upload.</param>
    /// <param name="category">Optional category for organization (logo, background, question).</param>
    /// <returns>The uploaded file information including URL.</returns>
    [HttpPost("images")]
    [ProducesResponseType(typeof(FileUploadResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [DisableRequestSizeLimit]
    public async Task<IActionResult> UploadImage(
        IFormFile file,
        [FromQuery] string? category = null,
        CancellationToken cancellationToken = default
    )
    {
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

        return HandleCreatedResult(result, nameof(GetFileInfo), v => new { fileId = v.FileId });
    }

    /// <summary>
    /// Upload multiple image files at once.
    /// </summary>
    /// <param name="files">The image files to upload.</param>
    /// <param name="category">Optional category for organization.</param>
    /// <returns>Bulk upload results with success/failure counts.</returns>
    [HttpPost("images/bulk")]
    [ProducesResponseType(typeof(BulkFileUploadResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [DisableRequestSizeLimit]
    public async Task<IActionResult> UploadImages(
        IFormFileCollection files,
        [FromQuery] string? category = null,
        CancellationToken cancellationToken = default
    )
    {
        var uploadItems = new List<FileUploadItem>();
        var streams = new List<Stream>();

        try
        {
            foreach (var file in files)
            {
                var stream = file.OpenReadStream();
                streams.Add(stream);

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
            foreach (var stream in streams)
            {
                await stream.DisposeAsync();
            }
        }
    }

    /// <summary>
    /// Get file information by ID.
    /// </summary>
    /// <param name="fileId">The file identifier.</param>
    /// <returns>The file information.</returns>
    [HttpGet("{fileId}")]
    [ProducesResponseType(typeof(FileInfoDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [AllowAnonymous]
    public async Task<IActionResult> GetFileInfo(
        string fileId,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _mediator.Send(new GetFileInfoQuery(fileId), cancellationToken);
        return HandleResult(result);
    }

    /// <summary>
    /// Download/serve a file by ID.
    /// </summary>
    /// <param name="fileId">The file identifier.</param>
    /// <returns>The file content.</returns>
    [HttpGet("{fileId}/download")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [AllowAnonymous]
    public async Task<IActionResult> DownloadFile(
        string fileId,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _mediator.Send(new DownloadFileQuery(fileId), cancellationToken);
        return HandleStreamFileResult(result, v => v.Stream, v => v.ContentType, v => v.FileName);
    }

    /// <summary>
    /// Delete a file by ID.
    /// </summary>
    /// <param name="fileId">The file identifier.</param>
    /// <returns>No content.</returns>
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
}
