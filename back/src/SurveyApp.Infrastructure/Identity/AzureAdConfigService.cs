using Microsoft.Extensions.Configuration;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;

namespace SurveyApp.Infrastructure.Identity;

/// <summary>
/// Service for retrieving Azure AD configuration from app settings.
/// </summary>
public class AzureAdConfigService(IConfiguration configuration) : IAzureAdConfigService
{
    private readonly IConfiguration _configuration = configuration;

    public AzureAdConfigDto GetConfiguration(string fallbackRedirectBaseUrl)
    {
        var clientId = _configuration["AzureAd:ClientId"];
        var tenantId = _configuration["AzureAd:TenantId"];
        var singleTenant = _configuration.GetValue("AzureAd:SingleTenant", true);

        if (string.IsNullOrEmpty(clientId))
        {
            return new AzureAdConfigDto { Enabled = false };
        }

        var allowedOrigins = _configuration.GetSection("AllowedOrigins").Get<string[]>();
        var frontendUrl = allowedOrigins?.FirstOrDefault() ?? fallbackRedirectBaseUrl;

        return new AzureAdConfigDto
        {
            Enabled = true,
            ClientId = clientId,
            TenantId = tenantId,
            Authority = singleTenant
                ? $"https://login.microsoftonline.com/{tenantId}"
                : "https://login.microsoftonline.com/common",
            RedirectUri = frontendUrl + "/",
            Scopes = ["openid", "profile", "email"],
        };
    }
}
