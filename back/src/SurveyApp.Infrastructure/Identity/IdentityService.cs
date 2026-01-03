using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Protocols;
using Microsoft.IdentityModel.Protocols.OpenIdConnect;
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
    IOptions<JwtSettings> jwtSettings,
    IOptions<AzureAdSettings> azureAdSettings,
    ILogger<IdentityService> logger
) : IIdentityService
{
    private readonly UserManager<ApplicationUser> _userManager = userManager;
    private readonly SignInManager<ApplicationUser> _signInManager = signInManager;
    private readonly IUserRepository _userRepository = userRepository;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;
    private readonly JwtSettings _jwtSettings = jwtSettings.Value;
    private readonly AzureAdSettings _azureAdSettings = azureAdSettings.Value;
    private readonly ILogger<IdentityService> _logger = logger;

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

    public async Task<AuthenticationResult> LoginAsync(
        string email,
        string password,
        bool rememberMe = false
    )
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

        return await GenerateAuthenticationResultAsync(user, rememberMe);
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

    private async Task<AuthenticationResult> GenerateAuthenticationResultAsync(
        ApplicationUser user,
        bool rememberMe = false
    )
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
        // When rememberMe is true, use extended refresh token expiration (30 days by default)
        // Otherwise, use standard expiration
        var refreshTokenDays = rememberMe
            ? _jwtSettings.RefreshTokenExpirationInDays * 3 // Extended: 3x the normal duration
            : _jwtSettings.RefreshTokenExpirationInDays;
        user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(refreshTokenDays);
        await _userManager.UpdateAsync(user);

        // Fetch domain user to get complete profile information
        var domainUser = await _userRepository.GetByIdAsync(user.DomainUserId);

        return AuthenticationResult.Success(
            tokenHandler.WriteToken(token),
            refreshToken,
            expiresAt,
            user.Id,
            user.Email!,
            domainUser?.FirstName ?? user.FirstName,
            domainUser?.LastName ?? user.LastName,
            domainUser?.FullName ?? $"{user.FirstName} {user.LastName}".Trim(),
            domainUser?.EmailConfirmed ?? false,
            domainUser?.AvatarId,
            domainUser?.LastLoginAt,
            domainUser?.IsActive ?? true,
            domainUser?.CreatedAt ?? DateTime.UtcNow,
            domainUser?.UpdatedAt
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

    #region Azure AD Authentication

    public async Task<AuthenticationResult> AuthenticateWithAzureAdAsync(
        string idToken,
        string? accessToken = null
    )
    {
        if (!_azureAdSettings.IsEnabled)
        {
            return AuthenticationResult.Failure("Infrastructure.Identity.AzureAdNotConfigured");
        }

        try
        {
            // Validate the Azure AD token
            var validatedToken = await ValidateAzureAdTokenAsync(idToken);
            if (validatedToken == null)
            {
                _logger.LogWarning("Azure AD token validation failed");
                return AuthenticationResult.Failure("Infrastructure.Identity.InvalidAzureAdToken");
            }

            // Extract claims from the token
            var azureAdObjectId = validatedToken
                .Claims.FirstOrDefault(c => c.Type == "oid" || c.Type == ClaimTypes.NameIdentifier)
                ?.Value;
            var azureAdTenantId = validatedToken.Claims.FirstOrDefault(c => c.Type == "tid")?.Value;
            var email = validatedToken
                .Claims.FirstOrDefault(c =>
                    c.Type == "email"
                    || c.Type == "preferred_username"
                    || c.Type == ClaimTypes.Email
                )
                ?.Value;
            var firstName =
                validatedToken
                    .Claims.FirstOrDefault(c =>
                        c.Type == "given_name" || c.Type == ClaimTypes.GivenName
                    )
                    ?.Value ?? "";
            var lastName =
                validatedToken
                    .Claims.FirstOrDefault(c =>
                        c.Type == "family_name" || c.Type == ClaimTypes.Surname
                    )
                    ?.Value ?? "";
            var displayName = validatedToken.Claims.FirstOrDefault(c => c.Type == "name")?.Value;

            // Use display name parts if first/last name not available
            if (
                string.IsNullOrEmpty(firstName)
                && string.IsNullOrEmpty(lastName)
                && !string.IsNullOrEmpty(displayName)
            )
            {
                var nameParts = displayName.Split(' ', 2);
                firstName = nameParts[0];
                lastName = nameParts.Length > 1 ? nameParts[1] : "";
            }

            if (string.IsNullOrEmpty(email) || string.IsNullOrEmpty(azureAdObjectId))
            {
                _logger.LogWarning("Azure AD token missing required claims (email or oid)");
                return AuthenticationResult.Failure("Infrastructure.Identity.MissingAzureAdClaims");
            }

            // Check tenant restriction if configured for single-tenant
            if (
                _azureAdSettings.SingleTenant
                && !string.IsNullOrEmpty(_azureAdSettings.TenantId)
                && azureAdTenantId != _azureAdSettings.TenantId
            )
            {
                _logger.LogWarning(
                    "Azure AD user from tenant {TenantId} attempted login, but only {AllowedTenant} is allowed",
                    azureAdTenantId,
                    _azureAdSettings.TenantId
                );
                return AuthenticationResult.Failure("Infrastructure.Identity.TenantNotAllowed");
            }

            // Find existing user by Azure AD Object ID or email
            var user = await FindUserByAzureAdIdOrEmailAsync(azureAdObjectId, email);

            if (user == null)
            {
                if (!_azureAdSettings.AutoProvisionUsers)
                {
                    _logger.LogInformation(
                        "Auto-provisioning disabled. User {Email} not found",
                        email
                    );
                    return AuthenticationResult.Failure(
                        "Infrastructure.Identity.UserNotProvisioned"
                    );
                }

                // Auto-provision new user
                _logger.LogInformation("Auto-provisioning new Azure AD user: {Email}", email);
                user = await CreateAzureAdUserAsync(
                    email,
                    firstName,
                    lastName,
                    azureAdObjectId,
                    azureAdTenantId!
                );

                if (user == null)
                {
                    return AuthenticationResult.Failure(
                        "Infrastructure.Identity.UserProvisioningFailed"
                    );
                }
            }
            else if (string.IsNullOrEmpty(user.AzureAdObjectId))
            {
                // Link existing email user to Azure AD
                _logger.LogInformation("Linking existing user {Email} to Azure AD", email);
                user.AzureAdObjectId = azureAdObjectId;
                user.AzureAdTenantId = azureAdTenantId;
                user.IsExternalUser = true;
                user.ExternalProvider = "AzureAD";
                user.EmailConfirmed = true; // Azure AD emails are verified
                await _userManager.UpdateAsync(user);
            }

            // Check if domain user exists (recovery for inconsistent state)
            var domainUserExists = await _userRepository.GetByIdAsync(user.DomainUserId);
            if (domainUserExists == null)
            {
                _logger.LogWarning(
                    "Identity user {Email} exists but domain user {DomainUserId} is missing. Creating domain user.",
                    email,
                    user.DomainUserId
                );

                // Create the missing domain user with the same ID as DomainUserId
                var domainUser = User.CreateWithId(
                    user.DomainUserId,
                    email,
                    string.Empty,
                    firstName,
                    lastName
                );
                domainUser.ConfirmEmail();
                await _userRepository.AddAsync(domainUser);
                await _unitOfWork.SaveChangesAsync();

                _logger.LogInformation(
                    "Domain user created for existing Identity user: {Email}, DomainUserId: {DomainUserId}",
                    email,
                    user.DomainUserId
                );
            }

            // Update last external login timestamp
            user.LastExternalLogin = DateTime.UtcNow;
            await _userManager.UpdateAsync(user);

            _logger.LogInformation("Azure AD authentication successful for user {Email}", email);
            return await GenerateAuthenticationResultAsync(user);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Azure AD authentication error");
            return AuthenticationResult.Failure("Infrastructure.Identity.AzureAdAuthError");
        }
    }

    public async Task<AuthenticationResult> LinkAzureAdAccountAsync(string userId, string idToken)
    {
        if (!_azureAdSettings.IsEnabled)
        {
            return AuthenticationResult.Failure("Infrastructure.Identity.AzureAdNotConfigured");
        }

        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            return AuthenticationResult.Failure("Infrastructure.Identity.UserNotFound");
        }

        // Validate and parse the Azure AD token
        var validatedToken = await ValidateAzureAdTokenAsync(idToken);
        if (validatedToken == null)
        {
            _logger.LogWarning("Azure AD token validation failed during account linking");
            return AuthenticationResult.Failure("Infrastructure.Identity.InvalidAzureAdToken");
        }

        // Extract claims from the token
        var azureAdObjectId = validatedToken
            .Claims.FirstOrDefault(c => c.Type == "oid" || c.Type == ClaimTypes.NameIdentifier)
            ?.Value;
        var azureAdTenantId = validatedToken.Claims.FirstOrDefault(c => c.Type == "tid")?.Value;

        if (string.IsNullOrEmpty(azureAdObjectId) || string.IsNullOrEmpty(azureAdTenantId))
        {
            return AuthenticationResult.Failure("Infrastructure.Identity.MissingAzureAdClaims");
        }

        // Check if Azure AD account is already linked to another user
        var existingUser = _userManager.Users.FirstOrDefault(u =>
            u.AzureAdObjectId == azureAdObjectId && u.Id != userId
        );

        if (existingUser != null)
        {
            _logger.LogWarning(
                "Azure AD account {ObjectId} is already linked to another user",
                azureAdObjectId
            );
            return AuthenticationResult.Failure(
                "Infrastructure.Identity.AzureAdAccountAlreadyLinked"
            );
        }

        user.AzureAdObjectId = azureAdObjectId;
        user.AzureAdTenantId = azureAdTenantId;
        user.IsExternalUser = true;
        user.ExternalProvider = "AzureAD";
        user.LastExternalLogin = DateTime.UtcNow;

        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
        {
            return AuthenticationResult.Failure("Infrastructure.Identity.AccountLinkingFailed");
        }

        _logger.LogInformation("Azure AD account linked successfully for user {UserId}", userId);
        return await GenerateAuthenticationResultAsync(user);
    }

    public async Task<bool> UnlinkAzureAdAccountAsync(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            return false;
        }

        // Only allow unlinking if user has a password set (alternative login method)
        var hasPassword = await _userManager.HasPasswordAsync(user);
        if (!hasPassword)
        {
            _logger.LogWarning(
                "Cannot unlink Azure AD from user {UserId} - no password set",
                userId
            );
            return false;
        }

        user.AzureAdObjectId = null;
        user.AzureAdTenantId = null;
        user.IsExternalUser = false;
        user.ExternalProvider = null;
        user.LastExternalLogin = null;

        var result = await _userManager.UpdateAsync(user);

        if (result.Succeeded)
        {
            _logger.LogInformation(
                "Azure AD account unlinked successfully for user {UserId}",
                userId
            );
        }

        return result.Succeeded;
    }

    private async Task<JwtSecurityToken?> ValidateAzureAdTokenAsync(string idToken)
    {
        try
        {
            var configManager = new ConfigurationManager<OpenIdConnectConfiguration>(
                $"{_azureAdSettings.Authority}/.well-known/openid-configuration",
                new OpenIdConnectConfigurationRetriever()
            );

            var config = await configManager.GetConfigurationAsync();

            // Build list of valid issuers
            var validIssuers = new List<string>
            {
                $"https://login.microsoftonline.com/{_azureAdSettings.TenantId}/v2.0",
                $"https://sts.windows.net/{_azureAdSettings.TenantId}/",
            };

            // Add multi-tenant issuers if not single-tenant
            if (!_azureAdSettings.SingleTenant)
            {
                validIssuers.Add("https://login.microsoftonline.com/common/v2.0");
                validIssuers.Add("https://login.microsoftonline.com/organizations/v2.0");
            }

            var validationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidIssuers = validIssuers,
                ValidateAudience = true,
                ValidAudiences = new[] { _azureAdSettings.ClientId },
                ValidateLifetime = true,
                IssuerSigningKeys = config.SigningKeys,
                ValidateIssuerSigningKey = true,
                ClockSkew = TimeSpan.FromMinutes(5),
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            tokenHandler.ValidateToken(idToken, validationParameters, out var validatedToken);
            return validatedToken as JwtSecurityToken;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Azure AD token validation failed");
            return null;
        }
    }

    private async Task<ApplicationUser?> FindUserByAzureAdIdOrEmailAsync(
        string azureAdObjectId,
        string email
    )
    {
        // First try to find by Azure AD Object ID
        var user = _userManager.Users.FirstOrDefault(u => u.AzureAdObjectId == azureAdObjectId);

        if (user != null)
            return user;

        // Fall back to email lookup
        return await _userManager.FindByEmailAsync(email);
    }

    private async Task<ApplicationUser?> CreateAzureAdUserAsync(
        string email,
        string firstName,
        string lastName,
        string azureAdObjectId,
        string azureAdTenantId
    )
    {
        // Validate email
        if (!Email.TryCreate(email, out var emailVo) || emailVo == null)
        {
            _logger.LogWarning(
                "Invalid email format during Azure AD user provisioning: {Email}",
                email
            );
            return null;
        }

        // Create domain user FIRST and save it before creating Identity user
        // This ensures we have a domain user even if Identity creation fails
        var domainUser = User.Create(emailVo.Value, string.Empty, firstName, lastName);
        domainUser.ConfirmEmail(); // Azure AD users are pre-verified
        await _userRepository.AddAsync(domainUser);

        // Save domain user BEFORE creating Identity user to ensure consistency
        await _unitOfWork.SaveChangesAsync();
        _logger.LogInformation(
            "Domain user created and saved for Azure AD user: {Email}, DomainUserId: {DomainUserId}",
            email,
            domainUser.Id
        );

        // Create identity user without password (SSO users don't have local passwords)
        var identityUser = new ApplicationUser
        {
            Id = domainUser.Id.ToString(),
            UserName = email,
            Email = email,
            FirstName = firstName,
            LastName = lastName,
            DomainUserId = domainUser.Id,
            AzureAdObjectId = azureAdObjectId,
            AzureAdTenantId = azureAdTenantId,
            IsExternalUser = true,
            ExternalProvider = "AzureAD",
            EmailConfirmed = true,
            LastExternalLogin = DateTime.UtcNow,
        };

        var result = await _userManager.CreateAsync(identityUser);
        if (!result.Succeeded)
        {
            _logger.LogError(
                "Failed to create Azure AD identity user: {Errors}. Domain user {DomainUserId} was already created.",
                string.Join(", ", result.Errors.Select(e => e.Description)),
                domainUser.Id
            );
            // Note: Domain user is already saved, but Identity creation failed.
            // This is acceptable - the user can retry SSO login and it will find the existing email.
            return null;
        }

        _logger.LogInformation(
            "Azure AD user provisioned successfully: {Email}, DomainUserId: {DomainUserId}",
            email,
            domainUser.Id
        );
        return identityUser;
    }

    #endregion
}
