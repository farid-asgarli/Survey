using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Domain.Entities;

namespace SurveyApp.Application.Features.Namespaces.Commands.UpdateNamespace;

public record UpdateNamespaceCommand : IRequest<Result<NamespaceDto>>, INamespaceCommand
{
    /// <summary>
    /// The permission required to execute this command.
    /// </summary>
    public static NamespacePermission RequiredPermission => NamespacePermission.ManageSettings;

    public Guid NamespaceId { get; init; }
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public string? LogoUrl { get; init; }
}
