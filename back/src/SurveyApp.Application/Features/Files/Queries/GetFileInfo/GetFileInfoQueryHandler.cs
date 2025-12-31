using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.DTOs;
using SurveyApp.Application.Services;

namespace SurveyApp.Application.Features.Files.Queries.GetFileInfo;

public class GetFileInfoQueryHandler(IFileStorageService fileStorageService)
    : IRequestHandler<GetFileInfoQuery, Result<FileInfoDto>>
{
    private readonly IFileStorageService _fileStorageService = fileStorageService;

    public async Task<Result<FileInfoDto>> Handle(
        GetFileInfoQuery request,
        CancellationToken cancellationToken
    )
    {
        try
        {
            var fileInfo = await _fileStorageService.GetFileInfoAsync(
                request.FileId,
                cancellationToken
            );

            return Result<FileInfoDto>.Success(
                new FileInfoDto
                {
                    Id = fileInfo.Id,
                    FileName = fileInfo.FileName,
                    ContentType = fileInfo.ContentType,
                    Size = fileInfo.Size,
                    CreatedAt = fileInfo.CreatedAt,
                    Url = fileInfo.Url,
                }
            );
        }
        catch (FileNotFoundException)
        {
            return Result<FileInfoDto>.Failure("Errors.FileNotFound", "NOT_FOUND");
        }
    }
}
