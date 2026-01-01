using MediatR;
using SurveyApp.Application.Common;

namespace SurveyApp.Application.Features.Files.Commands.DeleteFile;

/// <summary>
/// Command to delete a file.
/// </summary>
/// <param name="FileId">The file ID to delete.</param>
public record DeleteFileCommand(string FileId) : IRequest<Result<Unit>>;
