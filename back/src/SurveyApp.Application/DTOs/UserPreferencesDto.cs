namespace SurveyApp.Application.DTOs;

/// <summary>
/// DTO for user preferences data.
/// </summary>
public class UserPreferencesDto
{
    // Appearance
    public string ThemeMode { get; set; } = "system";
    public string ColorPalette { get; set; } = "purple";

    // Accessibility
    public AccessibilitySettingsDto Accessibility { get; set; } = new();

    // Regional
    public RegionalSettingsDto Regional { get; set; } = new();

    // Notifications
    public NotificationSettingsDto Notifications { get; set; } = new();

    // Dashboard & UI
    public DashboardSettingsDto Dashboard { get; set; } = new();

    // Survey Builder Defaults
    public SurveyBuilderSettingsDto SurveyBuilder { get; set; } = new();

    // Onboarding
    public OnboardingSettingsDto Onboarding { get; set; } = new();
}

/// <summary>
/// DTO for accessibility settings.
/// </summary>
public class AccessibilitySettingsDto
{
    public bool HighContrastMode { get; set; }
    public bool ReducedMotion { get; set; }
    public bool ScreenReaderOptimized { get; set; }
    public string FontSizeScale { get; set; } = "medium";
    public bool DyslexiaFriendlyFont { get; set; }
}

/// <summary>
/// DTO for regional settings.
/// </summary>
public class RegionalSettingsDto
{
    public string Language { get; set; } = "en";
    public string DateFormat { get; set; } = "MM/DD/YYYY";
    public string TimeFormat { get; set; } = "12h";
    public string Timezone { get; set; } = "UTC";
    public string DecimalSeparator { get; set; } = "dot";
    public string ThousandsSeparator { get; set; } = "comma";
}

/// <summary>
/// DTO for notification settings.
/// </summary>
public class NotificationSettingsDto
{
    public bool EmailNotifications { get; set; } = true;
    public bool ResponseAlerts { get; set; } = true;
    public bool WeeklyDigest { get; set; }
    public bool MarketingEmails { get; set; }
    public bool CompletionAlerts { get; set; } = true;
    public bool DistributionReports { get; set; } = true;
}

/// <summary>
/// DTO for dashboard and UI settings.
/// </summary>
public class DashboardSettingsDto
{
    public string DefaultViewMode { get; set; } = "grid";
    public int ItemsPerPage { get; set; } = 12;
    public bool SidebarCollapsed { get; set; }
    public string DefaultSortField { get; set; } = "updatedAt";
    public string DefaultSortOrder { get; set; } = "desc";
    public string[] HomeWidgets { get; set; } = ["stats", "recent", "quick-actions"];
    public string[] PinnedSurveyIds { get; set; } = [];
}

/// <summary>
/// DTO for survey builder default settings.
/// </summary>
public class SurveyBuilderSettingsDto
{
    public bool DefaultQuestionRequired { get; set; } = true;
    public Guid? DefaultThemeId { get; set; }
    public string DefaultWelcomeMessage { get; set; } = "";
    public string DefaultThankYouMessage { get; set; } = "";
    public int AutoSaveInterval { get; set; } = 30;
    public string QuestionNumberingStyle { get; set; } = "numbers";
    public bool ShowQuestionDescriptions { get; set; } = true;
    public string DefaultPageBreakBehavior { get; set; } = "auto";
}

/// <summary>
/// DTO for onboarding settings.
/// </summary>
public class OnboardingSettingsDto
{
    public string Status { get; set; } = "not_started";
    public DateTime? CompletedAt { get; set; }
    public int CurrentStep { get; set; } = 0;
    public bool HasSeenWelcomeTour { get; set; }
    public bool HasCompletedProfileSetup { get; set; }
    public bool HasCreatedFirstSurvey { get; set; }
}

/// <summary>
/// Request DTO for updating user preferences.
/// </summary>
public class UpdateUserPreferencesRequest
{
    // Appearance
    public string? ThemeMode { get; set; }
    public string? ColorPalette { get; set; }

    // Accessibility
    public AccessibilitySettingsDto? Accessibility { get; set; }

    // Regional
    public RegionalSettingsDto? Regional { get; set; }

    // Notifications
    public NotificationSettingsDto? Notifications { get; set; }

    // Dashboard & UI
    public DashboardSettingsDto? Dashboard { get; set; }

    // Survey Builder Defaults
    public SurveyBuilderSettingsDto? SurveyBuilder { get; set; }

    // Onboarding
    public OnboardingSettingsDto? Onboarding { get; set; }
}
