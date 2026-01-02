namespace SurveyApp.Application.DTOs;

/// <summary>
/// DTO for authentication response with token and user info.
/// </summary>
public class AuthResponseDto
{
    public string Token { get; set; } = null!;
    public string RefreshToken { get; set; } = null!;
    public DateTime ExpiresAt { get; set; }
    public AuthUserDto User { get; set; } = null!;
}

/// <summary>
/// DTO for token refresh response.
/// </summary>
public class TokenRefreshResponseDto
{
    public string Token { get; set; } = null!;
    public string RefreshToken { get; set; } = null!;
    public DateTime ExpiresAt { get; set; }
}

/// <summary>
/// User DTO for auth responses with complete user information.
/// </summary>
public class AuthUserDto
{
    public string Id { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string FirstName { get; set; } = null!;
    public string LastName { get; set; } = null!;
    public string FullName { get; set; } = null!;
    public bool EmailConfirmed { get; set; }
    public string? AvatarUrl { get; set; }
    public string? ProfilePictureUrl { get; set; }
    public DateTime? LastLoginAt { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

/// <summary>
/// Azure AD configuration response for frontend MSAL initialization.
/// </summary>
public class AzureAdConfigDto
{
    /// <summary>
    /// Whether Azure AD authentication is enabled.
    /// </summary>
    public bool Enabled { get; set; }

    /// <summary>
    /// Azure AD Application (Client) ID.
    /// </summary>
    public string? ClientId { get; set; }

    /// <summary>
    /// Azure AD Tenant (Directory) ID.
    /// </summary>
    public string? TenantId { get; set; }

    /// <summary>
    /// Azure AD authority URL for authentication.
    /// </summary>
    public string? Authority { get; set; }

    /// <summary>
    /// OAuth redirect URI for the frontend application.
    /// </summary>
    public string? RedirectUri { get; set; }

    /// <summary>
    /// OAuth scopes to request during authentication.
    /// </summary>
    public string[]? Scopes { get; set; }
}
