namespace SurveyApp.Application.Common.Interfaces;

/// <summary>
/// Service for handling user identity operations (authentication, registration, etc.)
/// </summary>
public interface IIdentityService
{
    // Standard authentication methods
    Task<AuthenticationResult> RegisterAsync(
        string email,
        string password,
        string firstName,
        string lastName
    );
    Task<AuthenticationResult> LoginAsync(string email, string password, bool rememberMe = false);
    Task<AuthenticationResult> RefreshTokenAsync(string token, string refreshToken);
    Task<bool> RevokeTokenAsync(string userId);
    Task<bool> ChangePasswordAsync(string userId, string currentPassword, string newPassword);
    Task<bool> ResetPasswordAsync(string email, string token, string newPassword);
    Task<string> GeneratePasswordResetTokenAsync(string email);
    Task<bool> ConfirmEmailAsync(string userId, string token);
    Task<string> GenerateEmailConfirmationTokenAsync(string userId);

    // Azure AD SSO methods
    /// <summary>
    /// Authenticates a user using an Azure AD ID token.
    /// Creates or links the user account as needed.
    /// </summary>
    /// <param name="idToken">The ID token from Azure AD authentication.</param>
    /// <param name="accessToken">Optional access token for additional claims.</param>
    /// <returns>Authentication result with JWT tokens if successful.</returns>
    Task<AuthenticationResult> AuthenticateWithAzureAdAsync(
        string idToken,
        string? accessToken = null
    );

    /// <summary>
    /// Links an existing user account to an Azure AD identity using an ID token.
    /// Allows users who registered with email/password to add SSO capability.
    /// </summary>
    /// <param name="userId">The local user ID to link.</param>
    /// <param name="idToken">The Azure AD ID token containing the identity claims.</param>
    /// <returns>Authentication result with updated user info.</returns>
    Task<AuthenticationResult> LinkAzureAdAccountAsync(string userId, string idToken);

    /// <summary>
    /// Unlinks an Azure AD identity from a user account.
    /// Only succeeds if the user has a password set (alternative login method).
    /// </summary>
    /// <param name="userId">The user ID to unlink.</param>
    /// <returns>True if unlinking succeeded, false otherwise.</returns>
    Task<bool> UnlinkAzureAdAccountAsync(string userId);
}

/// <summary>
/// Represents the result of an authentication operation.
/// </summary>
public record AuthenticationResult
{
    public bool Succeeded { get; init; }
    public string? Token { get; init; }
    public string? RefreshToken { get; init; }
    public DateTime? ExpiresAt { get; init; }
    public string? UserId { get; init; }
    public string? Email { get; init; }
    public string? FirstName { get; init; }
    public string? LastName { get; init; }
    public string? FullName { get; init; }
    public bool EmailConfirmed { get; init; }

    /// <summary>
    /// The ID of the user's selected avatar (e.g., "avatar-1", "avatar-32").
    /// </summary>
    public string? AvatarId { get; init; }

    public DateTime? LastLoginAt { get; init; }
    public bool IsActive { get; init; }
    public DateTime? CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }
    public IEnumerable<string> Errors { get; init; } = [];

    public static AuthenticationResult Success(
        string token,
        string refreshToken,
        DateTime expiresAt,
        string userId,
        string email,
        string firstName,
        string lastName,
        string fullName,
        bool emailConfirmed,
        string? avatarId,
        DateTime? lastLoginAt,
        bool isActive,
        DateTime createdAt,
        DateTime? updatedAt
    ) =>
        new()
        {
            Succeeded = true,
            Token = token,
            RefreshToken = refreshToken,
            ExpiresAt = expiresAt,
            UserId = userId,
            Email = email,
            FirstName = firstName,
            LastName = lastName,
            FullName = fullName,
            EmailConfirmed = emailConfirmed,
            AvatarId = avatarId,
            LastLoginAt = lastLoginAt,
            IsActive = isActive,
            CreatedAt = createdAt,
            UpdatedAt = updatedAt,
        };

    public static AuthenticationResult Failure(params string[] errors) =>
        new() { Succeeded = false, Errors = errors };
}
