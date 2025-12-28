using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Domain.Entities;

namespace SurveyApp.Application.Features.Themes.Commands.DuplicateTheme;

/// <summary>
/// Command to duplicate an existing theme.
/// </summary>
public record DuplicateThemeCommand : IRequest<Result<SurveyThemeDto>>, INamespaceCommand
{
    /// <summary>
    /// The permission required to execute this command.
    /// </summary>
    public static NamespacePermission RequiredPermission => NamespacePermission.ManageSettings;

    public Guid ThemeId { get; init; }
    public string? NewName { get; init; }
}
