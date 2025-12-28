using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Domain.Interfaces;

namespace SurveyApp.Application.Features.Users.Commands.UpdateUserPreferences;

public class UpdateUserPreferencesCommandHandler(
    IUserPreferencesRepository preferencesRepository,
    ICurrentUserService currentUserService,
    IUnitOfWork unitOfWork
) : IRequestHandler<UpdateUserPreferencesCommand, Result<UserPreferencesDto>>
{
    private readonly IUserPreferencesRepository _preferencesRepository = preferencesRepository;
    private readonly ICurrentUserService _currentUserService = currentUserService;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;

    public async Task<Result<UserPreferencesDto>> Handle(
        UpdateUserPreferencesCommand request,
        CancellationToken cancellationToken
    )
    {
        var userId = _currentUserService.UserId;
        if (!userId.HasValue)
        {
            return Result<UserPreferencesDto>.Failure("Handler.UserNotAuthenticated");
        }

        // Get or create preferences
        var preferences = await _preferencesRepository.GetOrCreateAsync(
            userId.Value,
            cancellationToken
        );

        // If preferences is null, the user doesn't exist in the domain Users table
        if (preferences == null)
        {
            return Result<UserPreferencesDto>.Failure(
                "User profile not found. Please ensure your account is properly set up."
            );
        }

        try
        {
            // Update appearance settings
            if (!string.IsNullOrEmpty(request.ThemeMode))
            {
                preferences.UpdateThemeMode(request.ThemeMode);
            }

            if (!string.IsNullOrEmpty(request.ColorPalette))
            {
                preferences.UpdateColorPalette(request.ColorPalette);
            }

            // Update accessibility settings
            if (request.Accessibility != null)
            {
                preferences.UpdateAccessibilitySettings(
                    request.Accessibility.HighContrastMode,
                    request.Accessibility.ReducedMotion,
                    request.Accessibility.ScreenReaderOptimized,
                    request.Accessibility.FontSizeScale,
                    request.Accessibility.DyslexiaFriendlyFont
                );
            }

            // Update regional settings
            if (request.Regional != null)
            {
                preferences.UpdateRegionalSettings(
                    request.Regional.Language,
                    request.Regional.DateFormat,
                    request.Regional.TimeFormat,
                    request.Regional.Timezone,
                    request.Regional.DecimalSeparator,
                    request.Regional.ThousandsSeparator
                );
            }

            // Update notification settings
            if (request.Notifications != null)
            {
                preferences.UpdateNotificationSettings(
                    request.Notifications.EmailNotifications,
                    request.Notifications.ResponseAlerts,
                    request.Notifications.WeeklyDigest,
                    request.Notifications.MarketingEmails,
                    request.Notifications.CompletionAlerts,
                    request.Notifications.DistributionReports
                );
            }

            // Update dashboard settings
            if (request.Dashboard != null)
            {
                preferences.UpdateDashboardSettings(
                    request.Dashboard.DefaultViewMode,
                    request.Dashboard.ItemsPerPage,
                    request.Dashboard.SidebarCollapsed,
                    request.Dashboard.DefaultSortField,
                    request.Dashboard.DefaultSortOrder,
                    System.Text.Json.JsonSerializer.Serialize(
                        request.Dashboard.HomeWidgets ?? ["stats", "recent", "quick-actions"]
                    ),
                    string.Join(",", request.Dashboard.PinnedSurveyIds ?? [])
                );
            }

            // Update survey builder settings
            if (request.SurveyBuilder != null)
            {
                preferences.UpdateSurveyBuilderSettings(
                    request.SurveyBuilder.DefaultQuestionRequired,
                    request.SurveyBuilder.DefaultThemeId,
                    request.SurveyBuilder.DefaultWelcomeMessage,
                    request.SurveyBuilder.DefaultThankYouMessage,
                    request.SurveyBuilder.AutoSaveInterval,
                    request.SurveyBuilder.QuestionNumberingStyle,
                    request.SurveyBuilder.ShowQuestionDescriptions,
                    request.SurveyBuilder.DefaultPageBreakBehavior
                );
            }

            // Update onboarding settings
            if (request.Onboarding != null)
            {
                if (!string.IsNullOrEmpty(request.Onboarding.Status))
                {
                    preferences.UpdateOnboardingStatus(request.Onboarding.Status);
                }
                preferences.UpdateOnboardingCurrentStep(request.Onboarding.CurrentStep);
                if (request.Onboarding.HasSeenWelcomeTour)
                {
                    preferences.MarkWelcomeTourSeen();
                }
                if (request.Onboarding.HasCompletedProfileSetup)
                {
                    preferences.MarkProfileSetupCompleted();
                }
                if (request.Onboarding.HasCreatedFirstSurvey)
                {
                    preferences.MarkFirstSurveyCreated();
                }
            }

            _preferencesRepository.Update(preferences);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            var dto = MapToDto(preferences);
            return Result<UserPreferencesDto>.Success(dto);
        }
        catch (ArgumentException ex)
        {
            return Result<UserPreferencesDto>.Failure(ex.Message);
        }
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
