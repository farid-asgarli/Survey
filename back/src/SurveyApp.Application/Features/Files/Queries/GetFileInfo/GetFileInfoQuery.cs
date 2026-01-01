using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.DTOs;

namespace SurveyApp.Application.Features.Files.Queries.GetFileInfo;

public record GetFileInfoQuery(string FileId) : IRequest<Result<FileInfoDto>>;
