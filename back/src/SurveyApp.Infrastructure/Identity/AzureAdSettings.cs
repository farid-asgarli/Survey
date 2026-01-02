namespace SurveyApp.Infrastructure.Identity;

/// <summary>
/// Configuration settings for Azure AD (Microsoft Entra ID) authentication.
/// </summary>
public class AzureAdSettings
{
    public const string SectionName = "AzureAd";

    /// <summary>
    /// Azure AD instance URL. Defaults to the public Azure AD endpoint.
    /// </summary>
    public string Instance { get; set; } = "https://login.microsoftonline.com/";

    /// <summary>
    /// Azure AD Tenant ID (Directory ID).
    /// </summary>
    public string TenantId { get; set; } = string.Empty;

    /// <summary>
    /// Application (Client) ID from Azure AD app registration.
    /// </summary>
    public string ClientId { get; set; } = string.Empty;

    /// <summary>
    /// Client Secret for confidential client authentication.
    /// </summary>
    public string ClientSecret { get; set; } = string.Empty;

    /// <summary>
    /// Callback path for OAuth redirect. Used by OpenID Connect middleware.
    /// </summary>
    public string CallbackPath { get; set; } = "/api/auth/azure-callback";

    /// <summary>
    /// Azure AD domain (e.g., "yourcompany.onmicrosoft.com").
    /// </summary>
    public string Domain { get; set; } = string.Empty;

    /// <summary>
    /// If true, only users from the configured tenant can sign in.
    /// If false, users from any Azure AD tenant can sign in (multi-tenant).
    /// </summary>
    public bool SingleTenant { get; set; } = true;

    /// <summary>
    /// If true, automatically create local user accounts for Azure AD users on first login.
    /// If false, users must be pre-provisioned before they can log in via Azure AD.
    /// </summary>
    public bool AutoProvisionUsers { get; set; } = true;

    /// <summary>
    /// Gets the Azure AD authority URL based on tenant configuration.
    /// For single-tenant apps, uses the specific tenant ID.
    /// For multi-tenant apps, uses the "common" endpoint.
    /// </summary>
    public string Authority =>
        SingleTenant && !string.IsNullOrEmpty(TenantId)
            ? $"{Instance}{TenantId}/v2.0"
            : $"{Instance}common/v2.0";

    /// <summary>
    /// Indicates whether Azure AD authentication is enabled (has valid configuration).
    /// </summary>
    public bool IsEnabled => !string.IsNullOrEmpty(ClientId);
}
