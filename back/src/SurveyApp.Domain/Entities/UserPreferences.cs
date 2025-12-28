using SurveyApp.Domain.Common;

namespace SurveyApp.Domain.Entities;

/// <summary>
/// Represents user preferences and settings that persist across sessions.
/// </summary>
public class UserPreferences : Entity<Guid>
{
    /// <summary>
    /// Gets the user ID these preferences belong to.
    /// </summary>
    public Guid UserId { get; private set; }

    #region Appearance Settings

    /// <summary>
    /// Gets the theme mode preference (light, dark, system).
    /// </summary>
    public string ThemeMode { get; private set; } = "system";

    /// <summary>
    /// Gets the color palette preference (purple, blue, green, orange, pink, teal).
    /// </summary>
    public string ColorPalette { get; private set; } = "purple";

    #endregion

    #region Accessibility Settings

    /// <summary>
    /// Gets whether high contrast mode is enabled.
    /// </summary>
    public bool HighContrastMode { get; private set; }

    /// <summary>
    /// Gets whether reduced motion is enabled.
    /// </summary>
    public bool ReducedMotion { get; private set; }

    /// <summary>
    /// Gets whether screen reader optimizations are enabled.
    /// </summary>
    public bool ScreenReaderOptimized { get; private set; }

    /// <summary>
    /// Gets the font size scaling preference (small, medium, large, extra-large).
    /// </summary>
    public string FontSizeScale { get; private set; } = "medium";

    /// <summary>
    /// Gets whether dyslexia-friendly font is enabled.
    /// </summary>
    public bool DyslexiaFriendlyFont { get; private set; }

    #endregion

    #region Language & Regional Settings

    /// <summary>
    /// Gets the preferred language code (en, az, ru).
    /// </summary>
    public string Language { get; private set; } = "en";

    /// <summary>
    /// Gets the preferred date format (MM/DD/YYYY, DD/MM/YYYY, YYYY-MM-DD).
    /// </summary>
    public string DateFormat { get; private set; } = "MM/DD/YYYY";

    /// <summary>
    /// Gets the preferred time format (12h, 24h).
    /// </summary>
    public string TimeFormat { get; private set; } = "12h";

    /// <summary>
    /// Gets the preferred timezone (IANA timezone name).
    /// </summary>
    public string Timezone { get; private set; } = "UTC";

    /// <summary>
    /// Gets the number format for decimal separator (dot, comma).
    /// </summary>
    public string DecimalSeparator { get; private set; } = "dot";

    /// <summary>
    /// Gets the number format for thousands separator (comma, dot, space, none).
    /// </summary>
    public string ThousandsSeparator { get; private set; } = "comma";

    #endregion

    #region Notification Settings

    /// <summary>
    /// Gets whether email notifications are enabled.
    /// </summary>
    public bool EmailNotifications { get; private set; } = true;

    /// <summary>
    /// Gets whether response alerts are enabled.
    /// </summary>
    public bool ResponseAlerts { get; private set; } = true;

    /// <summary>
    /// Gets whether weekly digest emails are enabled.
    /// </summary>
    public bool WeeklyDigest { get; private set; }

    /// <summary>
    /// Gets whether marketing emails are enabled.
    /// </summary>
    public bool MarketingEmails { get; private set; }

    /// <summary>
    /// Gets whether survey completion alerts are enabled.
    /// </summary>
    public bool CompletionAlerts { get; private set; } = true;

    /// <summary>
    /// Gets whether distribution reports are enabled.
    /// </summary>
    public bool DistributionReports { get; private set; } = true;

    #endregion

    #region Dashboard & UI Settings

    /// <summary>
    /// Gets the default view mode for surveys (grid, list).
    /// </summary>
    public string DefaultViewMode { get; private set; } = "grid";

    /// <summary>
    /// Gets the number of items per page in listings.
    /// </summary>
    public int ItemsPerPage { get; private set; } = 12;

    /// <summary>
    /// Gets whether the sidebar should be collapsed by default.
    /// </summary>
    public bool SidebarCollapsed { get; private set; }

    /// <summary>
    /// Gets the default sort field for survey listings.
    /// </summary>
    public string DefaultSortField { get; private set; } = "updatedAt";

    /// <summary>
    /// Gets the default sort order for survey listings.
    /// </summary>
    public string DefaultSortOrder { get; private set; } = "desc";

    /// <summary>
    /// Gets the JSON configuration for home page widgets.
    /// </summary>
    public string HomeWidgets { get; private set; } = "[\"stats\",\"recent\",\"quick-actions\"]";

    /// <summary>
    /// Gets the comma-separated list of pinned survey IDs.
    /// </summary>
    public string PinnedSurveyIds { get; private set; } = "";

    #endregion

    #region Survey Builder Defaults

    /// <summary>
    /// Gets whether new questions are required by default.
    /// </summary>
    public bool DefaultQuestionRequired { get; private set; } = true;

    /// <summary>
    /// Gets the default theme ID for new surveys (null = system default).
    /// </summary>
    public Guid? DefaultThemeId { get; private set; }

    /// <summary>
    /// Gets the default welcome message for new surveys.
    /// </summary>
    public string DefaultWelcomeMessage { get; private set; } = "";

    /// <summary>
    /// Gets the default thank you message for new surveys.
    /// </summary>
    public string DefaultThankYouMessage { get; private set; } = "";

    /// <summary>
    /// Gets the auto-save interval in seconds (0 = disabled).
    /// </summary>
    public int AutoSaveInterval { get; private set; } = 30;

    /// <summary>
    /// Gets the question numbering style (numbers, letters, none).
    /// </summary>
    public string QuestionNumberingStyle { get; private set; } = "numbers";

    /// <summary>
    /// Gets whether to show question descriptions by default.
    /// </summary>
    public bool ShowQuestionDescriptions { get; private set; } = true;

    /// <summary>
    /// Gets the default page break behavior (auto, manual, per-question).
    /// </summary>
    public string DefaultPageBreakBehavior { get; private set; } = "auto";

    #endregion

    #region Onboarding Settings

    /// <summary>
    /// Gets the onboarding status (not_started, in_progress, completed, skipped).
    /// </summary>
    public string OnboardingStatus { get; private set; } = "not_started";

    /// <summary>
    /// Gets the date and time when onboarding was completed or skipped.
    /// </summary>
    public DateTime? OnboardingCompletedAt { get; private set; }

    /// <summary>
    /// Gets the last step the user was on during onboarding.
    /// </summary>
    public int OnboardingCurrentStep { get; private set; } = 0;

    /// <summary>
    /// Gets whether the user has seen the welcome tour.
    /// </summary>
    public bool HasSeenWelcomeTour { get; private set; }

    /// <summary>
    /// Gets whether the user has completed their profile setup.
    /// </summary>
    public bool HasCompletedProfileSetup { get; private set; }

    /// <summary>
    /// Gets whether the user has created their first survey.
    /// </summary>
    public bool HasCreatedFirstSurvey { get; private set; }

    #endregion

    /// <summary>
    /// Gets the navigation property to the user.
    /// </summary>
    public User User { get; private set; } = null!;

    private UserPreferences() { }

    private UserPreferences(Guid id, Guid userId)
        : base(id)
    {
        UserId = userId;
    }

    /// <summary>
    /// Creates a new user preferences instance with default values.
    /// </summary>
    public static UserPreferences CreateDefault(Guid userId)
    {
        return new UserPreferences(Guid.NewGuid(), userId);
    }

    #region Appearance Updates

    /// <summary>
    /// Updates the theme mode.
    /// </summary>
    public void UpdateThemeMode(string themeMode)
    {
        if (!IsValidThemeMode(themeMode))
            throw new ArgumentException(
                "Invalid theme mode. Must be 'light', 'dark', or 'system'.",
                nameof(themeMode)
            );

        ThemeMode = themeMode;
    }

    /// <summary>
    /// Updates the color palette.
    /// </summary>
    public void UpdateColorPalette(string colorPalette)
    {
        if (!IsValidColorPalette(colorPalette))
            throw new ArgumentException("Invalid color palette.", nameof(colorPalette));

        ColorPalette = colorPalette;
    }

    #endregion

    #region Accessibility Updates

    /// <summary>
    /// Updates high contrast mode setting.
    /// </summary>
    public void UpdateHighContrastMode(bool enabled)
    {
        HighContrastMode = enabled;
    }

    /// <summary>
    /// Updates reduced motion setting.
    /// </summary>
    public void UpdateReducedMotion(bool enabled)
    {
        ReducedMotion = enabled;
    }

    /// <summary>
    /// Updates screen reader optimization setting.
    /// </summary>
    public void UpdateScreenReaderOptimized(bool enabled)
    {
        ScreenReaderOptimized = enabled;
    }

    /// <summary>
    /// Updates font size scale setting.
    /// </summary>
    public void UpdateFontSizeScale(string scale)
    {
        if (!IsValidFontSizeScale(scale))
            throw new ArgumentException(
                "Invalid font size scale. Must be 'small', 'medium', 'large', or 'extra-large'.",
                nameof(scale)
            );

        FontSizeScale = scale;
    }

    /// <summary>
    /// Updates dyslexia-friendly font setting.
    /// </summary>
    public void UpdateDyslexiaFriendlyFont(bool enabled)
    {
        DyslexiaFriendlyFont = enabled;
    }

    #endregion

    #region Language & Regional Updates

    /// <summary>
    /// Updates the preferred language.
    /// </summary>
    public void UpdateLanguage(string language)
    {
        if (!IsValidLanguage(language))
            throw new ArgumentException("Invalid language code.", nameof(language));

        Language = language;
    }

    /// <summary>
    /// Updates the date format preference.
    /// </summary>
    public void UpdateDateFormat(string dateFormat)
    {
        if (!IsValidDateFormat(dateFormat))
            throw new ArgumentException("Invalid date format.", nameof(dateFormat));

        DateFormat = dateFormat;
    }

    /// <summary>
    /// Updates the time format preference.
    /// </summary>
    public void UpdateTimeFormat(string timeFormat)
    {
        if (!IsValidTimeFormat(timeFormat))
            throw new ArgumentException(
                "Invalid time format. Must be '12h' or '24h'.",
                nameof(timeFormat)
            );

        TimeFormat = timeFormat;
    }

    /// <summary>
    /// Updates the timezone preference.
    /// </summary>
    public void UpdateTimezone(string timezone)
    {
        if (string.IsNullOrWhiteSpace(timezone))
            throw new ArgumentException("Timezone cannot be empty.", nameof(timezone));

        Timezone = timezone;
    }

    /// <summary>
    /// Updates the decimal separator preference.
    /// </summary>
    public void UpdateDecimalSeparator(string separator)
    {
        if (!IsValidDecimalSeparator(separator))
            throw new ArgumentException(
                "Invalid decimal separator. Must be 'dot' or 'comma'.",
                nameof(separator)
            );

        DecimalSeparator = separator;
    }

    /// <summary>
    /// Updates the thousands separator preference.
    /// </summary>
    public void UpdateThousandsSeparator(string separator)
    {
        if (!IsValidThousandsSeparator(separator))
            throw new ArgumentException(
                "Invalid thousands separator. Must be 'comma', 'dot', 'space', or 'none'.",
                nameof(separator)
            );

        ThousandsSeparator = separator;
    }

    #endregion

    #region Notification Updates

    /// <summary>
    /// Updates email notifications setting.
    /// </summary>
    public void UpdateEmailNotifications(bool enabled)
    {
        EmailNotifications = enabled;
    }

    /// <summary>
    /// Updates response alerts setting.
    /// </summary>
    public void UpdateResponseAlerts(bool enabled)
    {
        ResponseAlerts = enabled;
    }

    /// <summary>
    /// Updates weekly digest setting.
    /// </summary>
    public void UpdateWeeklyDigest(bool enabled)
    {
        WeeklyDigest = enabled;
    }

    /// <summary>
    /// Updates marketing emails setting.
    /// </summary>
    public void UpdateMarketingEmails(bool enabled)
    {
        MarketingEmails = enabled;
    }

    /// <summary>
    /// Updates completion alerts setting.
    /// </summary>
    public void UpdateCompletionAlerts(bool enabled)
    {
        CompletionAlerts = enabled;
    }

    /// <summary>
    /// Updates distribution reports setting.
    /// </summary>
    public void UpdateDistributionReports(bool enabled)
    {
        DistributionReports = enabled;
    }

    #endregion

    #region Bulk Updates

    /// <summary>
    /// Updates all appearance settings at once.
    /// </summary>
    public void UpdateAppearanceSettings(string themeMode, string colorPalette)
    {
        UpdateThemeMode(themeMode);
        UpdateColorPalette(colorPalette);
    }

    /// <summary>
    /// Updates all accessibility settings at once.
    /// </summary>
    public void UpdateAccessibilitySettings(
        bool highContrastMode,
        bool reducedMotion,
        bool screenReaderOptimized,
        string fontSizeScale,
        bool dyslexiaFriendlyFont
    )
    {
        UpdateHighContrastMode(highContrastMode);
        UpdateReducedMotion(reducedMotion);
        UpdateScreenReaderOptimized(screenReaderOptimized);
        UpdateFontSizeScale(fontSizeScale);
        UpdateDyslexiaFriendlyFont(dyslexiaFriendlyFont);
    }

    /// <summary>
    /// Updates all regional settings at once.
    /// </summary>
    public void UpdateRegionalSettings(
        string language,
        string dateFormat,
        string timeFormat,
        string timezone,
        string decimalSeparator,
        string thousandsSeparator
    )
    {
        UpdateLanguage(language);
        UpdateDateFormat(dateFormat);
        UpdateTimeFormat(timeFormat);
        UpdateTimezone(timezone);
        UpdateDecimalSeparator(decimalSeparator);
        UpdateThousandsSeparator(thousandsSeparator);
    }

    /// <summary>
    /// Updates all notification settings at once.
    /// </summary>
    public void UpdateNotificationSettings(
        bool emailNotifications,
        bool responseAlerts,
        bool weeklyDigest,
        bool marketingEmails,
        bool completionAlerts,
        bool distributionReports
    )
    {
        UpdateEmailNotifications(emailNotifications);
        UpdateResponseAlerts(responseAlerts);
        UpdateWeeklyDigest(weeklyDigest);
        UpdateMarketingEmails(marketingEmails);
        UpdateCompletionAlerts(completionAlerts);
        UpdateDistributionReports(distributionReports);
    }

    #endregion

    #region Validation Helpers

    private static bool IsValidThemeMode(string mode) => mode is "light" or "dark" or "system";

    private static bool IsValidColorPalette(string palette) =>
        palette is "purple" or "blue" or "green" or "orange" or "pink" or "teal";

    private static bool IsValidFontSizeScale(string scale) =>
        scale is "small" or "medium" or "large" or "extra-large";

    private static bool IsValidLanguage(string language) => language is "en" or "az" or "ru";

    private static bool IsValidDateFormat(string format) =>
        format is "MM/DD/YYYY" or "DD/MM/YYYY" or "YYYY-MM-DD";

    private static bool IsValidTimeFormat(string format) => format is "12h" or "24h";

    private static bool IsValidDecimalSeparator(string separator) => separator is "dot" or "comma";

    private static bool IsValidThousandsSeparator(string separator) =>
        separator is "comma" or "dot" or "space" or "none";

    private static bool IsValidViewMode(string mode) => mode is "grid" or "list";

    private static bool IsValidSortField(string field) =>
        field is "title" or "createdAt" or "updatedAt" or "status" or "responseCount";

    private static bool IsValidSortOrder(string order) => order is "asc" or "desc";

    private static bool IsValidQuestionNumberingStyle(string style) =>
        style is "numbers" or "letters" or "none";

    private static bool IsValidPageBreakBehavior(string behavior) =>
        behavior is "auto" or "manual" or "per-question";

    #endregion

    #region Dashboard & UI Updates

    /// <summary>
    /// Updates the default view mode for surveys.
    /// </summary>
    public void UpdateDefaultViewMode(string viewMode)
    {
        if (!IsValidViewMode(viewMode))
            throw new ArgumentException(
                "Invalid view mode. Must be 'grid' or 'list'.",
                nameof(viewMode)
            );
        DefaultViewMode = viewMode;
    }

    /// <summary>
    /// Updates the items per page setting.
    /// </summary>
    public void UpdateItemsPerPage(int count)
    {
        if (count < 6 || count > 50)
            throw new ArgumentException("Items per page must be between 6 and 50.", nameof(count));
        ItemsPerPage = count;
    }

    /// <summary>
    /// Updates the sidebar collapsed setting.
    /// </summary>
    public void UpdateSidebarCollapsed(bool collapsed)
    {
        SidebarCollapsed = collapsed;
    }

    /// <summary>
    /// Updates the default sort field.
    /// </summary>
    public void UpdateDefaultSortField(string field)
    {
        if (!IsValidSortField(field))
            throw new ArgumentException("Invalid sort field.", nameof(field));
        DefaultSortField = field;
    }

    /// <summary>
    /// Updates the default sort order.
    /// </summary>
    public void UpdateDefaultSortOrder(string order)
    {
        if (!IsValidSortOrder(order))
            throw new ArgumentException(
                "Invalid sort order. Must be 'asc' or 'desc'.",
                nameof(order)
            );
        DefaultSortOrder = order;
    }

    /// <summary>
    /// Updates the home page widgets configuration.
    /// </summary>
    public void UpdateHomeWidgets(string widgetsJson)
    {
        HomeWidgets = widgetsJson ?? "[\"stats\",\"recent\",\"quick-actions\"]";
    }

    /// <summary>
    /// Updates the pinned survey IDs.
    /// </summary>
    public void UpdatePinnedSurveyIds(string surveyIds)
    {
        PinnedSurveyIds = surveyIds ?? "";
    }

    /// <summary>
    /// Updates all dashboard settings at once.
    /// </summary>
    public void UpdateDashboardSettings(
        string defaultViewMode,
        int itemsPerPage,
        bool sidebarCollapsed,
        string defaultSortField,
        string defaultSortOrder,
        string homeWidgets,
        string pinnedSurveyIds
    )
    {
        UpdateDefaultViewMode(defaultViewMode);
        UpdateItemsPerPage(itemsPerPage);
        UpdateSidebarCollapsed(sidebarCollapsed);
        UpdateDefaultSortField(defaultSortField);
        UpdateDefaultSortOrder(defaultSortOrder);
        UpdateHomeWidgets(homeWidgets);
        UpdatePinnedSurveyIds(pinnedSurveyIds);
    }

    #endregion

    #region Survey Builder Updates

    /// <summary>
    /// Updates the default question required setting.
    /// </summary>
    public void UpdateDefaultQuestionRequired(bool required)
    {
        DefaultQuestionRequired = required;
    }

    /// <summary>
    /// Updates the default theme ID.
    /// </summary>
    public void UpdateDefaultThemeId(Guid? themeId)
    {
        DefaultThemeId = themeId;
    }

    /// <summary>
    /// Updates the default welcome message.
    /// </summary>
    public void UpdateDefaultWelcomeMessage(string message)
    {
        DefaultWelcomeMessage = message ?? "";
    }

    /// <summary>
    /// Updates the default thank you message.
    /// </summary>
    public void UpdateDefaultThankYouMessage(string message)
    {
        DefaultThankYouMessage = message ?? "";
    }

    /// <summary>
    /// Updates the auto-save interval.
    /// </summary>
    public void UpdateAutoSaveInterval(int seconds)
    {
        if (seconds < 0 || seconds > 300)
            throw new ArgumentException(
                "Auto-save interval must be between 0 and 300 seconds.",
                nameof(seconds)
            );
        AutoSaveInterval = seconds;
    }

    /// <summary>
    /// Updates the question numbering style.
    /// </summary>
    public void UpdateQuestionNumberingStyle(string style)
    {
        if (!IsValidQuestionNumberingStyle(style))
            throw new ArgumentException(
                "Invalid numbering style. Must be 'numbers', 'letters', or 'none'.",
                nameof(style)
            );
        QuestionNumberingStyle = style;
    }

    /// <summary>
    /// Updates the show question descriptions setting.
    /// </summary>
    public void UpdateShowQuestionDescriptions(bool show)
    {
        ShowQuestionDescriptions = show;
    }

    /// <summary>
    /// Updates the default page break behavior.
    /// </summary>
    public void UpdateDefaultPageBreakBehavior(string behavior)
    {
        if (!IsValidPageBreakBehavior(behavior))
            throw new ArgumentException("Invalid page break behavior.", nameof(behavior));
        DefaultPageBreakBehavior = behavior;
    }

    /// <summary>
    /// Updates all survey builder settings at once.
    /// </summary>
    public void UpdateSurveyBuilderSettings(
        bool defaultQuestionRequired,
        Guid? defaultThemeId,
        string defaultWelcomeMessage,
        string defaultThankYouMessage,
        int autoSaveInterval,
        string questionNumberingStyle,
        bool showQuestionDescriptions,
        string defaultPageBreakBehavior
    )
    {
        UpdateDefaultQuestionRequired(defaultQuestionRequired);
        UpdateDefaultThemeId(defaultThemeId);
        UpdateDefaultWelcomeMessage(defaultWelcomeMessage);
        UpdateDefaultThankYouMessage(defaultThankYouMessage);
        UpdateAutoSaveInterval(autoSaveInterval);
        UpdateQuestionNumberingStyle(questionNumberingStyle);
        UpdateShowQuestionDescriptions(showQuestionDescriptions);
        UpdateDefaultPageBreakBehavior(defaultPageBreakBehavior);
    }

    #endregion

    #region Onboarding Updates

    /// <summary>
    /// Updates the onboarding status.
    /// </summary>
    public void UpdateOnboardingStatus(string status)
    {
        if (!IsValidOnboardingStatus(status))
            throw new ArgumentException(
                "Invalid onboarding status. Must be 'not_started', 'in_progress', 'completed', or 'skipped'.",
                nameof(status)
            );
        OnboardingStatus = status;

        if (status == "completed" || status == "skipped")
        {
            OnboardingCompletedAt = DateTime.UtcNow;
        }
    }

    /// <summary>
    /// Updates the current onboarding step.
    /// </summary>
    public void UpdateOnboardingCurrentStep(int step)
    {
        if (step < 0 || step > 10)
            throw new ArgumentException("Onboarding step must be between 0 and 10.", nameof(step));
        OnboardingCurrentStep = step;

        if (OnboardingStatus == "not_started" && step > 0)
        {
            OnboardingStatus = "in_progress";
        }
    }

    /// <summary>
    /// Marks the welcome tour as seen.
    /// </summary>
    public void MarkWelcomeTourSeen()
    {
        HasSeenWelcomeTour = true;
    }

    /// <summary>
    /// Marks the profile setup as completed.
    /// </summary>
    public void MarkProfileSetupCompleted()
    {
        HasCompletedProfileSetup = true;
    }

    /// <summary>
    /// Marks the first survey as created.
    /// </summary>
    public void MarkFirstSurveyCreated()
    {
        HasCreatedFirstSurvey = true;
    }

    /// <summary>
    /// Completes the onboarding process.
    /// </summary>
    public void CompleteOnboarding()
    {
        OnboardingStatus = "completed";
        OnboardingCompletedAt = DateTime.UtcNow;
        HasSeenWelcomeTour = true;
        HasCompletedProfileSetup = true;
    }

    /// <summary>
    /// Skips the onboarding process.
    /// </summary>
    public void SkipOnboarding()
    {
        OnboardingStatus = "skipped";
        OnboardingCompletedAt = DateTime.UtcNow;
    }

    /// <summary>
    /// Resets onboarding to allow user to restart it.
    /// </summary>
    public void ResetOnboarding()
    {
        OnboardingStatus = "not_started";
        OnboardingCompletedAt = null;
        OnboardingCurrentStep = 0;
        HasSeenWelcomeTour = false;
        HasCompletedProfileSetup = false;
    }

    private static bool IsValidOnboardingStatus(string status)
    {
        return status is "not_started" or "in_progress" or "completed" or "skipped";
    }

    #endregion
}
