using MediatR;
using Microsoft.Extensions.Logging;
using SurveyApp.Application.Common;
using SurveyApp.Application.Services;

namespace SurveyApp.Application.Features.Files.Commands.DeleteFile;

public class DeleteFileCommandHandler(
    IFileStorageService fileStorageService,
    ILogger<DeleteFileCommandHandler> logger
) : IRequestHandler<DeleteFileCommand, Result<Unit>>
{
    private readonly IFileStorageService _fileStorageService = fileStorageService;
    private readonly ILogger<DeleteFileCommandHandler> _logger = logger;

    public async Task<Result<Unit>> Handle(
        DeleteFileCommand request,
        CancellationToken cancellationToken
    )
    {
        var deleted = await _fileStorageService.DeleteFileAsync(request.FileId, cancellationToken);

        if (!deleted)
        {
            return Result<Unit>.Failure("Errors.FileNotFound", "NOT_FOUND");
        }

        _logger.LogInformation("File deleted: {FileId}", request.FileId);
        return Result<Unit>.Success(Unit.Value);
    }
}
