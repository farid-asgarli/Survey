using SurveyApp.Domain.Enums;

namespace SurveyApp.Application.DTOs;

/// <summary>
/// DTO for survey theme data.
/// </summary>
public class SurveyThemeDto
{
    public Guid Id { get; set; }
    public Guid NamespaceId { get; set; }
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public bool IsDefault { get; set; }
    public bool IsPublic { get; set; }
    public bool IsSystem { get; set; }
    public bool IsDark { get; set; }
    public ThemeColorsDto Colors { get; set; } = null!;
    public ThemeTypographyDto Typography { get; set; } = null!;
    public ThemeLayoutDto Layout { get; set; } = null!;
    public ThemeBrandingDto Branding { get; set; } = null!;
    public ThemeButtonDto Button { get; set; } = null!;
    public string? CustomCss { get; set; }
    public int UsageCount { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

/// <summary>
/// DTO for theme colors - Material Design 3.
/// </summary>
public class ThemeColorsDto
{
    // Primary
    public string Primary { get; set; } = "#6750A4";
    public string OnPrimary { get; set; } = "#FFFFFF";
    public string PrimaryContainer { get; set; } = "#EADDFF";
    public string OnPrimaryContainer { get; set; } = "#21005D";

    // Secondary
    public string Secondary { get; set; } = "#625B71";
    public string OnSecondary { get; set; } = "#FFFFFF";
    public string SecondaryContainer { get; set; } = "#E8DEF8";
    public string OnSecondaryContainer { get; set; } = "#1D192B";

    // Surface
    public string Surface { get; set; } = "#FEF7FF";
    public string SurfaceContainerLowest { get; set; } = "#FFFFFF";
    public string SurfaceContainerLow { get; set; } = "#F7F2FA";
    public string SurfaceContainer { get; set; } = "#F3EDF7";
    public string SurfaceContainerHigh { get; set; } = "#ECE6F0";
    public string SurfaceContainerHighest { get; set; } = "#E6E0E9";
    public string OnSurface { get; set; } = "#1D1B20";
    public string OnSurfaceVariant { get; set; } = "#49454F";

    // Outline
    public string Outline { get; set; } = "#79747E";
    public string OutlineVariant { get; set; } = "#CAC4D0";

    // Semantic
    public string Error { get; set; } = "#B3261E";
    public string Success { get; set; } = "#2AA86A";

    // Legacy - deprecated but kept for backward compatibility
    public string Background { get; set; } = "#FEF7FF";
    public string Text { get; set; } = "#1D1B20";
    public string Accent { get; set; } = "#7D5260";
}

/// <summary>
/// DTO for theme typography.
/// </summary>
public class ThemeTypographyDto
{
    public string FontFamily { get; set; } = "Inter";
    public string HeadingFontFamily { get; set; } = "Inter";
    public int BaseFontSize { get; set; } = 16;
}

/// <summary>
/// DTO for theme layout.
/// </summary>
public class ThemeLayoutDto
{
    public ThemeLayout Layout { get; set; } = ThemeLayout.Classic;
    public string? BackgroundImageUrl { get; set; }
    public BackgroundImagePosition BackgroundPosition { get; set; } = BackgroundImagePosition.Cover;
    public bool ShowProgressBar { get; set; } = true;
    public ProgressBarStyle ProgressBarStyle { get; set; } = ProgressBarStyle.Bar;
}

/// <summary>
/// DTO for theme branding.
/// </summary>
public class ThemeBrandingDto
{
    public string? LogoUrl { get; set; }
    public LogoPosition LogoPosition { get; set; } = LogoPosition.TopLeft;
    public bool ShowPoweredBy { get; set; } = true;
}

/// <summary>
/// DTO for theme button styling.
/// </summary>
public class ThemeButtonDto
{
    public ButtonStyle Style { get; set; } = ButtonStyle.Rounded;
    public string TextColor { get; set; } = "#FFFFFF";
}

/// <summary>
/// DTO for theme list item (summary).
/// </summary>
public class SurveyThemeSummaryDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public bool IsDefault { get; set; }
    public bool IsPublic { get; set; }
    public bool IsSystem { get; set; }
    public bool IsDark { get; set; }
    public string PrimaryColor { get; set; } = null!;
    public string SecondaryColor { get; set; } = null!;
    public string BackgroundColor { get; set; } = null!;
    public ThemeLayout Layout { get; set; }
    public int UsageCount { get; set; }
    public DateTime CreatedAt { get; set; }
}

/// <summary>
/// DTO for creating a theme.
/// </summary>
public class CreateThemeDto
{
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public bool IsPublic { get; set; } = true;
    public ThemeColorsDto? Colors { get; set; }
    public ThemeTypographyDto? Typography { get; set; }
    public ThemeLayoutDto? Layout { get; set; }
    public ThemeBrandingDto? Branding { get; set; }
    public ThemeButtonDto? Button { get; set; }
    public string? CustomCss { get; set; }
}

/// <summary>
/// DTO for updating a theme.
/// </summary>
public class UpdateThemeDto
{
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public bool IsPublic { get; set; }
    public ThemeColorsDto Colors { get; set; } = null!;
    public ThemeTypographyDto Typography { get; set; } = null!;
    public ThemeLayoutDto Layout { get; set; } = null!;
    public ThemeBrandingDto Branding { get; set; } = null!;
    public ThemeButtonDto Button { get; set; } = null!;
    public string? CustomCss { get; set; }
}

/// <summary>
/// DTO for theme preview.
/// </summary>
public class ThemePreviewDto
{
    public SurveyThemeDto Theme { get; set; } = null!;
    public string GeneratedCss { get; set; } = null!;
}

/// <summary>
/// DTO for applying theme to survey.
/// </summary>
public class ApplyThemeDto
{
    public Guid SurveyId { get; set; }
}
