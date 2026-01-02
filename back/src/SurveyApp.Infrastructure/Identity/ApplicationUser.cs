using Microsoft.AspNetCore.Identity;

namespace SurveyApp.Infrastructure.Identity;

public class ApplicationUser : IdentityUser
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;

    /// <summary>
    /// Links to the domain User entity for business logic
    /// </summary>
    public Guid DomainUserId { get; set; }

    /// <summary>
    /// JWT refresh token for token rotation
    /// </summary>
    public string? RefreshToken { get; set; }

    /// <summary>
    /// Expiry time for the refresh token
    /// </summary>
    public DateTime RefreshTokenExpiryTime { get; set; }

    // Azure AD SSO Properties (for future SSO integration)

    /// <summary>
    /// Azure AD Object ID (unique identifier from Azure AD)
    /// </summary>
    public string? AzureAdObjectId { get; set; }

    /// <summary>
    /// Azure AD Tenant ID
    /// </summary>
    public string? AzureAdTenantId { get; set; }

    /// <summary>
    /// Indicates if user authenticated via external provider
    /// </summary>
    public bool IsExternalUser { get; set; }

    /// <summary>
    /// External provider name (e.g., "AzureAD", "Google")
    /// </summary>
    public string? ExternalProvider { get; set; }

    /// <summary>
    /// Last login time via external provider
    /// </summary>
    public DateTime? LastExternalLogin { get; set; }
}
