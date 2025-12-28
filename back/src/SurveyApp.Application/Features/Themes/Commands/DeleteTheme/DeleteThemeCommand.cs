using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Domain.Entities;

namespace SurveyApp.Application.Features.Themes.Commands.DeleteTheme;

/// <summary>
/// Command to delete a survey theme.
/// </summary>
public record DeleteThemeCommand : IRequest<Result<bool>>, INamespaceCommand
{
    /// <summary>
    /// The permission required to execute this command.
    /// </summary>
    public static NamespacePermission RequiredPermission => NamespacePermission.ManageSettings;

    public Guid ThemeId { get; init; }
}
