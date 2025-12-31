using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Services;

namespace SurveyApp.Application.Features.Files.Queries.DownloadFile;

public class DownloadFileQueryHandler(IFileStorageService fileStorageService)
    : IRequestHandler<DownloadFileQuery, Result<FileDownloadResult>>
{
    private readonly IFileStorageService _fileStorageService = fileStorageService;

    public async Task<Result<FileDownloadResult>> Handle(
        DownloadFileQuery request,
        CancellationToken cancellationToken
    )
    {
        try
        {
            var fileInfo = await _fileStorageService.GetFileInfoAsync(
                request.FileId,
                cancellationToken
            );
            var stream = await _fileStorageService.DownloadFileAsync(
                request.FileId,
                cancellationToken
            );

            return Result<FileDownloadResult>.Success(
                new FileDownloadResult
                {
                    Stream = stream,
                    ContentType = fileInfo.ContentType,
                    FileName = fileInfo.FileName,
                }
            );
        }
        catch (FileNotFoundException)
        {
            return Result<FileDownloadResult>.Failure("Errors.FileNotFound", "NOT_FOUND");
        }
    }
}
