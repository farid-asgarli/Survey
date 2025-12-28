using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Domain.Interfaces;

namespace SurveyApp.Application.Features.Users.Queries.GetUserPreferences;

public class GetUserPreferencesQueryHandler(
    IUserPreferencesRepository preferencesRepository,
    ICurrentUserService currentUserService,
    IUnitOfWork unitOfWork
) : IRequestHandler<GetUserPreferencesQuery, Result<UserPreferencesDto>>
{
    private readonly IUserPreferencesRepository _preferencesRepository = preferencesRepository;
    private readonly ICurrentUserService _currentUserService = currentUserService;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;

    public async Task<Result<UserPreferencesDto>> Handle(
        GetUserPreferencesQuery request,
        CancellationToken cancellationToken
    )
    {
        var userId = _currentUserService.UserId;
        if (!userId.HasValue)
        {
            return Result<UserPreferencesDto>.Failure("User not authenticated.");
        }

        // Get or create preferences (creates default if not exists)
        var preferences = await _preferencesRepository.GetOrCreateAsync(
            userId.Value,
            cancellationToken
        );

        // If preferences is null, the user doesn't exist in the domain Users table
        if (preferences == null)
        {
            // Return default preferences without persisting
            // This can happen if the user exists in Identity but not in domain Users table
            return Result<UserPreferencesDto>.Success(GetDefaultPreferencesDto());
        }

        // Save if new preferences were created
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = MapToDto(preferences);
        return Result<UserPreferencesDto>.Success(dto);
    }

    private static UserPreferencesDto GetDefaultPreferencesDto()
    {
        return new UserPreferencesDto
        {
            ThemeMode = "system",
            ColorPalette = "purple",
            Accessibility = new AccessibilitySettingsDto
            {
                HighContrastMode = false,
                ReducedMotion = false,
                ScreenReaderOptimized = false,
                FontSizeScale = "medium",
                DyslexiaFriendlyFont = false,
            },
            Regional = new RegionalSettingsDto
            {
                Language = "en",
                DateFormat = "MM/DD/YYYY",
                TimeFormat = "12h",
                Timezone = "UTC",
                DecimalSeparator = "dot",
                ThousandsSeparator = "comma",
            },
            Notifications = new NotificationSettingsDto
            {
                EmailNotifications = true,
                ResponseAlerts = true,
                WeeklyDigest = false,
                MarketingEmails = false,
                CompletionAlerts = true,
                DistributionReports = true,
            },
            SurveyBuilder = new SurveyBuilderSettingsDto
            {
                AutoSaveInterval = 30,
                DefaultQuestionRequired = true,
                QuestionNumberingStyle = "numbers",
                ShowQuestionDescriptions = true,
                DefaultPageBreakBehavior = "auto",
            },
            Dashboard = new DashboardSettingsDto
            {
                DefaultViewMode = "grid",
                ItemsPerPage = 12,
                SidebarCollapsed = false,
                DefaultSortField = "updatedAt",
                DefaultSortOrder = "desc",
            },
            Onboarding = new OnboardingSettingsDto { Status = "not_started", CurrentStep = 0 },
        };
    }

    private static UserPreferencesDto MapToDto(Domain.Entities.UserPreferences preferences)
    {
        return new UserPreferencesDto
        {
            ThemeMode = preferences.ThemeMode,
            ColorPalette = preferences.ColorPalette,
            Accessibility = new AccessibilitySettingsDto
            {
                HighContrastMode = preferences.HighContrastMode,
                ReducedMotion = preferences.ReducedMotion,
                ScreenReaderOptimized = preferences.ScreenReaderOptimized,
                FontSizeScale = preferences.FontSizeScale,
                DyslexiaFriendlyFont = preferences.DyslexiaFriendlyFont,
            },
            Regional = new RegionalSettingsDto
            {
                Language = preferences.Language,
                DateFormat = preferences.DateFormat,
                TimeFormat = preferences.TimeFormat,
                Timezone = preferences.Timezone,
                DecimalSeparator = preferences.DecimalSeparator,
                ThousandsSeparator = preferences.ThousandsSeparator,
            },
            Notifications = new NotificationSettingsDto
            {
                EmailNotifications = preferences.EmailNotifications,
                ResponseAlerts = preferences.ResponseAlerts,
                WeeklyDigest = preferences.WeeklyDigest,
                MarketingEmails = preferences.MarketingEmails,
                CompletionAlerts = preferences.CompletionAlerts,
                DistributionReports = preferences.DistributionReports,
            },
            Dashboard = new DashboardSettingsDto
            {
                DefaultViewMode = preferences.DefaultViewMode,
                ItemsPerPage = preferences.ItemsPerPage,
                SidebarCollapsed = preferences.SidebarCollapsed,
                DefaultSortField = preferences.DefaultSortField,
                DefaultSortOrder = preferences.DefaultSortOrder,
                HomeWidgets = ParseJsonArray(preferences.HomeWidgets),
                PinnedSurveyIds = preferences.PinnedSurveyIds.Split(
                    ',',
                    StringSplitOptions.RemoveEmptyEntries
                ),
            },
            SurveyBuilder = new SurveyBuilderSettingsDto
            {
                DefaultQuestionRequired = preferences.DefaultQuestionRequired,
                DefaultThemeId = preferences.DefaultThemeId,
                DefaultWelcomeMessage = preferences.DefaultWelcomeMessage,
                DefaultThankYouMessage = preferences.DefaultThankYouMessage,
                AutoSaveInterval = preferences.AutoSaveInterval,
                QuestionNumberingStyle = preferences.QuestionNumberingStyle,
                ShowQuestionDescriptions = preferences.ShowQuestionDescriptions,
                DefaultPageBreakBehavior = preferences.DefaultPageBreakBehavior,
            },
            Onboarding = new OnboardingSettingsDto
            {
                Status = preferences.OnboardingStatus,
                CompletedAt = preferences.OnboardingCompletedAt,
                CurrentStep = preferences.OnboardingCurrentStep,
                HasSeenWelcomeTour = preferences.HasSeenWelcomeTour,
                HasCompletedProfileSetup = preferences.HasCompletedProfileSetup,
                HasCreatedFirstSurvey = preferences.HasCreatedFirstSurvey,
            },
        };
    }

    private static string[] ParseJsonArray(string json)
    {
        try
        {
            return System.Text.Json.JsonSerializer.Deserialize<string[]>(json)
                ?? ["stats", "recent", "quick-actions"];
        }
        catch
        {
            return ["stats", "recent", "quick-actions"];
        }
    }
}
