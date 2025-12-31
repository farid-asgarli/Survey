using MediatR;
using SurveyApp.Application.Common;

namespace SurveyApp.Application.Features.Files.Commands.DeleteFile;

public record DeleteFileCommand : IRequest<Result<Unit>>
{
    public required string FileId { get; init; }
}
