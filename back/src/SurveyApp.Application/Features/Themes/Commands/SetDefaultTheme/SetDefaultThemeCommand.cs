using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Domain.Entities;

namespace SurveyApp.Application.Features.Themes.Commands.SetDefaultTheme;

/// <summary>
/// Command to set a theme as the default for a namespace.
/// </summary>
/// <param name="ThemeId">The theme ID to set as default.</param>
public record SetDefaultThemeCommand(Guid ThemeId) : IRequest<Result<Unit>>, INamespaceCommand
{
    /// <summary>
    /// The permission required to execute this command.
    /// </summary>
    public static NamespacePermission RequiredPermission => NamespacePermission.ManageSettings;
}
