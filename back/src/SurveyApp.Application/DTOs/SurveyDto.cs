using SurveyApp.Domain.Enums;

namespace SurveyApp.Application.DTOs;

/// <summary>
/// DTO for survey data.
/// </summary>
public class SurveyDto
{
    public Guid Id { get; set; }
    public Guid NamespaceId { get; set; }
    public string Title { get; set; } = null!;
    public string? Description { get; set; }
    public SurveyType Type { get; set; }
    public CxMetricType? CxMetricType { get; set; }
    public SurveyStatus Status { get; set; }
    public string? WelcomeMessage { get; set; }
    public string? ThankYouMessage { get; set; }
    public string AccessToken { get; set; } = null!;
    public DateTime? PublishedAt { get; set; }
    public DateTime? ClosedAt { get; set; }
    public DateTime? StartsAt { get; set; }
    public DateTime? EndsAt { get; set; }
    public bool AllowAnonymousResponses { get; set; }
    public bool AllowMultipleResponses { get; set; }
    public int? MaxResponses { get; set; }
    public Guid? ThemeId { get; set; }
    public string? PresetThemeId { get; set; }
    public string? ThemeCustomizations { get; set; }
    public int QuestionCount { get; set; }
    public int ResponseCount { get; set; }
    public DateTime CreatedAt { get; set; }
    public Guid? CreatedBy { get; set; }

    /// <summary>
    /// The default language code for this survey.
    /// </summary>
    public string DefaultLanguage { get; set; } = "en";

    /// <summary>
    /// The language of the returned content.
    /// </summary>
    public string Language { get; set; } = "en";

    /// <summary>
    /// List of available language codes for this survey.
    /// </summary>
    public IReadOnlyList<string> AvailableLanguages { get; set; } = [];
}

/// <summary>
/// DTO for survey details with questions.
/// </summary>
public class SurveyDetailsDto : SurveyDto
{
    public IReadOnlyList<QuestionDto> Questions { get; set; } = [];
}

/// <summary>
/// DTO for survey list item (summary).
/// </summary>
public class SurveyListItemDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = null!;
    public string? Description { get; set; }
    public SurveyType Type { get; set; }
    public CxMetricType? CxMetricType { get; set; }
    public SurveyStatus Status { get; set; }
    public int QuestionCount { get; set; }
    public int ResponseCount { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? PublishedAt { get; set; }
    public DateTime? ClosedAt { get; set; }
    public string DefaultLanguage { get; set; } = "en";
}

/// <summary>
/// DTO for public survey (for respondents).
/// </summary>
public class PublicSurveyDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = null!;
    public string? Description { get; set; }
    public string? WelcomeMessage { get; set; }
    public string? ThankYouMessage { get; set; }
    public bool AllowAnonymousResponses { get; set; }
    public bool IsAnonymous { get; set; }
    public IReadOnlyList<PublicQuestionDto> Questions { get; set; } = [];
    public PublicSurveyThemeDto? Theme { get; set; }

    /// <summary>
    /// The language of the returned content.
    /// </summary>
    public string Language { get; set; } = "en";

    /// <summary>
    /// List of available language codes for this survey.
    /// </summary>
    public IReadOnlyList<string> AvailableLanguages { get; set; } = [];
}

/// <summary>
/// Simplified theme DTO for public survey respondents.
/// Contains only the visual styling information needed to render the survey.
/// </summary>
public class PublicSurveyThemeDto
{
    // Primary colors
    public string PrimaryColor { get; set; } = "#6750A4";
    public string? OnPrimaryColor { get; set; }
    public string? PrimaryContainerColor { get; set; }
    public string? OnPrimaryContainerColor { get; set; }

    // Secondary colors
    public string SecondaryColor { get; set; } = "#625B71";
    public string? OnSecondaryColor { get; set; }
    public string? SecondaryContainerColor { get; set; }
    public string? OnSecondaryContainerColor { get; set; }

    // Surface colors
    public string? SurfaceColor { get; set; }
    public string? SurfaceContainerLowestColor { get; set; }
    public string? SurfaceContainerLowColor { get; set; }
    public string? SurfaceContainerColor { get; set; }
    public string? SurfaceContainerHighColor { get; set; }
    public string? SurfaceContainerHighestColor { get; set; }
    public string? OnSurfaceColor { get; set; }
    public string? OnSurfaceVariantColor { get; set; }

    // Outline colors
    public string? OutlineColor { get; set; }
    public string? OutlineVariantColor { get; set; }

    // Legacy colors
    public string? BackgroundColor { get; set; }
    public string? TextColor { get; set; }

    // Typography
    public string? FontFamily { get; set; }
    public string? HeadingFontFamily { get; set; }
    public int? BaseFontSize { get; set; }

    // Button styling
    public int ButtonStyle { get; set; }
    public string? ButtonTextColor { get; set; }

    // Branding
    public string? LogoUrl { get; set; }
    public int? LogoSize { get; set; }
    public bool? ShowLogoBackground { get; set; }
    public string? LogoBackgroundColor { get; set; }
    public string? BrandingTitle { get; set; }
    public string? BrandingSubtitle { get; set; }

    // Layout
    public string? BackgroundImageUrl { get; set; }
    public string? BackgroundPosition { get; set; }
    public bool ShowProgressBar { get; set; } = true;
    public int ProgressBarStyle { get; set; }

    // Additional branding
    public bool ShowPoweredBy { get; set; } = true;
}
