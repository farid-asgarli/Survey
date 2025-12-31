using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.DTOs;

namespace SurveyApp.Application.Features.Files.Commands.UploadImage;

public record UploadImageCommand : IRequest<Result<FileUploadResponseDto>>
{
    public required Stream FileStream { get; init; }
    public required string FileName { get; init; }
    public required string ContentType { get; init; }
    public required long FileSize { get; init; }
    public string? Category { get; init; }
}
