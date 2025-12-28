using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.DTOs;

namespace SurveyApp.Application.Features.Users.Commands.UpdateUserPreferences;

public record UpdateUserPreferencesCommand : IRequest<Result<UserPreferencesDto>>
{
    // Appearance
    public string? ThemeMode { get; init; }
    public string? ColorPalette { get; init; }

    // Accessibility
    public AccessibilitySettingsDto? Accessibility { get; init; }

    // Regional
    public RegionalSettingsDto? Regional { get; init; }

    // Notifications
    public NotificationSettingsDto? Notifications { get; init; }

    // Dashboard & UI
    public DashboardSettingsDto? Dashboard { get; init; }

    // Survey Builder Defaults
    public SurveyBuilderSettingsDto? SurveyBuilder { get; init; }

    // Onboarding
    public OnboardingSettingsDto? Onboarding { get; init; }
}
