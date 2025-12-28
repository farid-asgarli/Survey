using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Domain.Entities;

namespace SurveyApp.Application.Features.Themes.Commands.UpdateTheme;

/// <summary>
/// Command to update an existing survey theme.
/// </summary>
public record UpdateThemeCommand : IRequest<Result<SurveyThemeDto>>, INamespaceCommand
{
    /// <summary>
    /// The permission required to execute this command.
    /// </summary>
    public static NamespacePermission RequiredPermission => NamespacePermission.ManageSettings;

    public Guid ThemeId { get; init; }
    public string Name { get; init; } = null!;
    public string? Description { get; init; }
    public bool IsPublic { get; init; }
    public ThemeColorsDto Colors { get; init; } = null!;
    public ThemeTypographyDto Typography { get; init; } = null!;
    public ThemeLayoutDto Layout { get; init; } = null!;
    public ThemeBrandingDto Branding { get; init; } = null!;
    public ThemeButtonDto Button { get; init; } = null!;
    public string? CustomCss { get; init; }
}
