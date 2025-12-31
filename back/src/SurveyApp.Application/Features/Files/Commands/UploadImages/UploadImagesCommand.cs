using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.DTOs;

namespace SurveyApp.Application.Features.Files.Commands.UploadImages;

public record UploadImagesCommand : IRequest<Result<BulkFileUploadResponseDto>>
{
    public required IReadOnlyList<FileUploadItem> Files { get; init; }
    public string? Category { get; init; }
}

public record FileUploadItem
{
    public required Stream FileStream { get; init; }
    public required string FileName { get; init; }
    public required string ContentType { get; init; }
    public required long FileSize { get; init; }
}
