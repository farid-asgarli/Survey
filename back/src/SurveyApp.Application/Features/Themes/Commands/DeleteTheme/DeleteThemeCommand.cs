using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Domain.Entities;

namespace SurveyApp.Application.Features.Themes.Commands.DeleteTheme;

/// <summary>
/// Command to delete a survey theme.
/// </summary>
/// <param name="ThemeId">The theme ID to delete.</param>
public record DeleteThemeCommand(Guid ThemeId) : IRequest<Result<Unit>>, INamespaceCommand
{
    /// <summary>
    /// The permission required to execute this command.
    /// </summary>
    public static NamespacePermission RequiredPermission => NamespacePermission.ManageSettings;
}
