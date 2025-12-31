using MediatR;
using SurveyApp.Application.Common;

namespace SurveyApp.Application.Features.Files.Queries.DownloadFile;

public record DownloadFileQuery : IRequest<Result<FileDownloadResult>>
{
    public required string FileId { get; init; }
}

public record FileDownloadResult
{
    public required Stream Stream { get; init; }
    public required string ContentType { get; init; }
    public required string FileName { get; init; }
}
