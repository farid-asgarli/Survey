using MediatR;
using SurveyApp.Application.Common;

namespace SurveyApp.Application.Features.Files.Queries.DownloadFile;

public record DownloadFileQuery(string FileId) : IRequest<Result<FileDownloadResult>>;

public record FileDownloadResult
{
    public required Stream Stream { get; init; }
    public required string ContentType { get; init; }
    public required string FileName { get; init; }
}
