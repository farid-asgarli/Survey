namespace SurveyApp.Infrastructure.Identity;

public interface IIdentityService
{
    Task<AuthenticationResult> RegisterAsync(
        string email,
        string password,
        string firstName,
        string lastName
    );
    Task<AuthenticationResult> LoginAsync(string email, string password);
    Task<AuthenticationResult> RefreshTokenAsync(string token, string refreshToken);
    Task<bool> RevokeTokenAsync(string userId);
    Task<bool> ChangePasswordAsync(string userId, string currentPassword, string newPassword);
    Task<bool> ResetPasswordAsync(string email, string token, string newPassword);
    Task<string> GeneratePasswordResetTokenAsync(string email);
    Task<bool> ConfirmEmailAsync(string userId, string token);
    Task<string> GenerateEmailConfirmationTokenAsync(string userId);
}

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
    public IEnumerable<string> Errors { get; init; } = [];

    public static AuthenticationResult Success(
        string token,
        string refreshToken,
        DateTime expiresAt,
        string userId,
        string email,
        string firstName,
        string lastName
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
        };

    public static AuthenticationResult Failure(params string[] errors) =>
        new() { Succeeded = false, Errors = errors };
}
