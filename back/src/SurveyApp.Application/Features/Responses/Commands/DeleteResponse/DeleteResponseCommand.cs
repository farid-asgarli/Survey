using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Domain.Entities;

namespace SurveyApp.Application.Features.Responses.Commands.DeleteResponse;

/// <summary>
/// Command to delete a response.
/// </summary>
/// <param name="ResponseId">The response ID to delete.</param>
public record DeleteResponseCommand(Guid ResponseId) : IRequest<Result<Unit>>, INamespaceCommand
{
    /// <summary>
    /// The permission required to execute this command.
    /// </summary>
    public static NamespacePermission RequiredPermission => NamespacePermission.ViewResponses;
}
