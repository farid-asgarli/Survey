using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Domain.Entities;

namespace SurveyApp.Application.Features.Themes.Commands.CreateTheme;

/// <summary>
/// Command to create a new survey theme.
/// </summary>
public record CreateThemeCommand : IRequest<Result<SurveyThemeDto>>, INamespaceCommand
{
    public static NamespacePermission RequiredPermission => NamespacePermission.ManageSettings;

    public string Name { get; init; } = null!;
    public string? Description { get; init; }
    public string LanguageCode { get; init; } = "en";
    public bool IsPublic { get; init; } = true;
    public ThemeColorsDto? Colors { get; init; }
    public ThemeTypographyDto? Typography { get; init; }
    public ThemeLayoutDto? Layout { get; init; }
    public ThemeBrandingDto? Branding { get; init; }
    public ThemeButtonDto? Button { get; init; }
    public string? CustomCss { get; init; }
}
