using SurveyApp.Application.DTOs;

namespace SurveyApp.Application.Common.Interfaces;

/// <summary>
/// Service for retrieving Azure AD configuration settings.
/// </summary>
public interface IAzureAdConfigService
{
    /// <summary>
    /// Gets the Azure AD configuration for frontend MSAL initialization.
    /// </summary>
    /// <param name="fallbackRedirectBaseUrl">Fallback base URL if no frontend URL is configured.</param>
    /// <returns>Azure AD configuration DTO.</returns>
    AzureAdConfigDto GetConfiguration(string fallbackRedirectBaseUrl);
}
