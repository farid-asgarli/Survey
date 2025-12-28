using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Domain.Entities;

namespace SurveyApp.Application.Features.Themes.Commands.SetDefaultTheme;

/// <summary>
/// Command to set a theme as the default for a namespace.
/// </summary>
public record SetDefaultThemeCommand : IRequest<Result<bool>>, INamespaceCommand
{
    /// <summary>
    /// The permission required to execute this command.
    /// </summary>
    public static NamespacePermission RequiredPermission => NamespacePermission.ManageSettings;

    public Guid ThemeId { get; init; }
}
