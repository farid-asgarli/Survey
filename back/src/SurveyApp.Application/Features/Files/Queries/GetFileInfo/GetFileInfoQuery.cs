using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.DTOs;

namespace SurveyApp.Application.Features.Files.Queries.GetFileInfo;

public record GetFileInfoQuery : IRequest<Result<FileInfoDto>>
{
    public required string FileId { get; init; }
}
