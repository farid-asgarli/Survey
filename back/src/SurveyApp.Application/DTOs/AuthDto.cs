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
/// Simplified user DTO for auth responses.
/// </summary>
public class AuthUserDto
{
    public string Id { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
}
