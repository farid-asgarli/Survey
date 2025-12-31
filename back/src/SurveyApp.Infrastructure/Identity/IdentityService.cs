using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Domain.Entities;
using SurveyApp.Domain.Interfaces;
using SurveyApp.Domain.ValueObjects;

namespace SurveyApp.Infrastructure.Identity;

public class IdentityService(
    UserManager<ApplicationUser> userManager,
    SignInManager<ApplicationUser> signInManager,
    IUserRepository userRepository,
    IUnitOfWork unitOfWork,
    IOptions<JwtSettings> jwtSettings
) : IIdentityService
{
    private readonly UserManager<ApplicationUser> _userManager = userManager;
    private readonly SignInManager<ApplicationUser> _signInManager = signInManager;
    private readonly IUserRepository _userRepository = userRepository;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;
    private readonly JwtSettings _jwtSettings = jwtSettings.Value;

    public async Task<AuthenticationResult> RegisterAsync(
        string email,
        string password,
        string firstName,
        string lastName
    )
    {
        var existingUser = await _userManager.FindByEmailAsync(email);
        if (existingUser != null)
        {
            return AuthenticationResult.Failure("Infrastructure.Identity.UserAlreadyExists");
        }

        // Validate email
        if (!Email.TryCreate(email, out var emailVo) || emailVo == null)
        {
            return AuthenticationResult.Failure("Infrastructure.Identity.InvalidEmailAddress");
        }

        // Create domain user (User.Create expects email string, firstName, lastName, and password hash)
        var domainUser = User.Create(emailVo.Value, string.Empty, firstName, lastName);
        await _userRepository.AddAsync(domainUser);

        // Create identity user
        var identityUser = new ApplicationUser
        {
            Id = domainUser.Id.ToString(),
            UserName = email,
            Email = email,
            FirstName = firstName,
            LastName = lastName,
            DomainUserId = domainUser.Id,
        };

        var result = await _userManager.CreateAsync(identityUser, password);
        if (!result.Succeeded)
        {
            return AuthenticationResult.Failure([.. result.Errors.Select(e => e.Description)]);
        }

        await _unitOfWork.SaveChangesAsync();

        return await GenerateAuthenticationResultAsync(identityUser);
    }

    public async Task<AuthenticationResult> LoginAsync(string email, string password)
    {
        var user = await _userManager.FindByEmailAsync(email);
        if (user == null)
        {
            return AuthenticationResult.Failure("Infrastructure.Identity.InvalidEmailOrPassword");
        }

        var result = await _signInManager.CheckPasswordSignInAsync(
            user,
            password,
            lockoutOnFailure: true
        );
        if (!result.Succeeded)
        {
            if (result.IsLockedOut)
            {
                return AuthenticationResult.Failure("Infrastructure.Identity.AccountLocked");
            }
            return AuthenticationResult.Failure("Infrastructure.Identity.InvalidEmailOrPassword");
        }

        return await GenerateAuthenticationResultAsync(user);
    }

    public async Task<AuthenticationResult> RefreshTokenAsync(string token, string refreshToken)
    {
        var principal = GetPrincipalFromExpiredToken(token);
        if (principal == null)
        {
            return AuthenticationResult.Failure("Infrastructure.Identity.InvalidToken");
        }

        var userId = principal.FindFirstValue(ClaimTypes.NameIdentifier);
        var user = await _userManager.FindByIdAsync(userId!);

        if (
            user == null
            || user.RefreshToken != refreshToken
            || user.RefreshTokenExpiryTime <= DateTime.UtcNow
        )
        {
            return AuthenticationResult.Failure("Infrastructure.Identity.InvalidRefreshToken");
        }

        return await GenerateAuthenticationResultAsync(user);
    }

    public async Task<bool> RevokeTokenAsync(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            return false;
        }

        // Invalidate the refresh token
        user.RefreshToken = null;
        user.RefreshTokenExpiryTime = DateTime.MinValue;

        var result = await _userManager.UpdateAsync(user);
        return result.Succeeded;
    }

    public async Task<bool> ChangePasswordAsync(
        string userId,
        string currentPassword,
        string newPassword
    )
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            return false;
        }

        var result = await _userManager.ChangePasswordAsync(user, currentPassword, newPassword);
        return result.Succeeded;
    }

    public async Task<bool> ResetPasswordAsync(string email, string token, string newPassword)
    {
        var user = await _userManager.FindByEmailAsync(email);
        if (user == null)
        {
            return false;
        }

        var result = await _userManager.ResetPasswordAsync(user, token, newPassword);
        return result.Succeeded;
    }

    public async Task<string> GeneratePasswordResetTokenAsync(string email)
    {
        var user = await _userManager.FindByEmailAsync(email);
        if (user == null)
        {
            return string.Empty;
        }

        return await _userManager.GeneratePasswordResetTokenAsync(user);
    }

    public async Task<bool> ConfirmEmailAsync(string userId, string token)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            return false;
        }

        var result = await _userManager.ConfirmEmailAsync(user, token);
        return result.Succeeded;
    }

    public async Task<string> GenerateEmailConfirmationTokenAsync(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            return string.Empty;
        }

        return await _userManager.GenerateEmailConfirmationTokenAsync(user);
    }

    private async Task<AuthenticationResult> GenerateAuthenticationResultAsync(ApplicationUser user)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.ASCII.GetBytes(_jwtSettings.Secret);
        var expiresAt = DateTime.UtcNow.AddMinutes(_jwtSettings.ExpirationInMinutes);

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id),
            new(JwtRegisteredClaimNames.Email, user.Email!),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new("firstName", user.FirstName),
            new("lastName", user.LastName),
        };

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = expiresAt,
            Issuer = _jwtSettings.Issuer,
            Audience = _jwtSettings.Audience,
            SigningCredentials = new SigningCredentials(
                new SymmetricSecurityKey(key),
                SecurityAlgorithms.HmacSha256Signature
            ),
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        var refreshToken = GenerateRefreshToken();

        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(
            _jwtSettings.RefreshTokenExpirationInDays
        );
        await _userManager.UpdateAsync(user);

        return AuthenticationResult.Success(
            tokenHandler.WriteToken(token),
            refreshToken,
            expiresAt,
            user.Id,
            user.Email!,
            user.FirstName,
            user.LastName
        );
    }

    private ClaimsPrincipal? GetPrincipalFromExpiredToken(string token)
    {
        var tokenValidationParameters = new TokenValidationParameters
        {
            ValidateAudience = true,
            ValidateIssuer = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.ASCII.GetBytes(_jwtSettings.Secret)
            ),
            ValidIssuer = _jwtSettings.Issuer,
            ValidAudience = _jwtSettings.Audience,
            ValidateLifetime = false, // Allow expired tokens
        };

        var tokenHandler = new JwtSecurityTokenHandler();

        try
        {
            var principal = tokenHandler.ValidateToken(
                token,
                tokenValidationParameters,
                out var securityToken
            );

            if (
                securityToken is not JwtSecurityToken jwtSecurityToken
                || !jwtSecurityToken.Header.Alg.Equals(
                    SecurityAlgorithms.HmacSha256,
                    StringComparison.InvariantCultureIgnoreCase
                )
            )
            {
                return null;
            }

            return principal;
        }
        catch
        {
            return null;
        }
    }

    private static string GenerateRefreshToken()
    {
        var randomNumber = new byte[64];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomNumber);
        return Convert.ToBase64String(randomNumber);
    }
}
