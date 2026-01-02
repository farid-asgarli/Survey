# Azure AD (Microsoft SSO) Integration Guide

## Executive Summary

This document provides a comprehensive step-by-step guide to integrate Azure AD (Microsoft Entra ID) Single Sign-On (SSO) into the Survey Application. The current authentication system uses ASP.NET Core Identity with JWT tokens. We'll extend this to support Azure AD authentication while maintaining backward compatibility with the existing email/password authentication.

---

## Table of Contents

1. [Current Authentication Architecture](#1-current-authentication-architecture)
2. [Database Architecture Decision](#2-database-architecture-decision)
3. [Azure AD Integration Strategy](#3-azure-ad-integration-strategy)
4. [Prerequisites](#4-prerequisites)
5. [Backend Implementation](#5-backend-implementation)
6. [Frontend Implementation](#6-frontend-implementation)
7. [Database Migrations](#7-database-migrations)
8. [Configuration](#8-configuration)
9. [Testing](#9-testing)
10. [Security Considerations](#10-security-considerations)
11. [Rollout Strategy](#11-rollout-strategy)

---

## 1. Current Authentication Architecture

### Backend (ASP.NET Core)

The current authentication stack consists of:

| Component          | Location                                                                                                                  | Purpose                                                       |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| `IdentityService`  | [Infrastructure/Identity/IdentityService.cs](back/src/SurveyApp.Infrastructure/Identity/IdentityService.cs)               | Core authentication logic (login, register, token generation) |
| `ApplicationUser`  | [Infrastructure/Identity/ApplicationUser.cs](back/src/SurveyApp.Infrastructure/Identity/ApplicationUser.cs)               | ASP.NET Identity user entity                                  |
| `JwtSettings`      | [Infrastructure/Identity/JwtSettings.cs](back/src/SurveyApp.Infrastructure/Identity/JwtSettings.cs)                       | JWT configuration                                             |
| `AuthController`   | [API/Controllers/AuthController.cs](back/src/SurveyApp.API/Controllers/AuthController.cs)                                 | Authentication endpoints                                      |
| `IIdentityService` | [Application/Common/Interfaces/IIdentityService.cs](back/src/SurveyApp.Application/Common/Interfaces/IIdentityService.cs) | Interface definition                                          |

**Current Database Setup:**

- `surveyapp` database - Domain data (surveys, responses, namespaces, users)
- `surveyapp_identity` database - ASP.NET Identity tables

**Current Flow:**

```
User → Email/Password → IdentityService.LoginAsync() → JWT Token + Refresh Token
```

---

## 2. Database Architecture Decision

### Consolidation: One Database, Two Schemas

We recommend consolidating to **one database** with **separate schemas** for better manageability:

| Schema     | Purpose              | Tables                                                 |
| ---------- | -------------------- | ------------------------------------------------------ |
| `public`   | Domain/Business data | `Users`, `Surveys`, `Responses`, `Namespaces`, etc.    |
| `identity` | ASP.NET Identity     | `AspNetUsers`, `AspNetRoles`, `AspNetUserTokens`, etc. |

### Benefits of This Approach

1. **Simplified Infrastructure** - One connection string, one database to backup/manage
2. **Logical Separation** - Schemas keep Identity and Domain data organized
3. **Transactional Integrity** - Cross-schema transactions are simpler within one database
4. **Easier Migrations** - Single migration history

### Why We Still Need Local User Records

Even with Azure AD, local user records are required because:

| Reason                | Explanation                                                    |
| --------------------- | -------------------------------------------------------------- |
| **Foreign Keys**      | Surveys, responses, namespaces reference local `User` entity   |
| **App-Specific Data** | Preferences, avatars, namespace memberships aren't in Azure AD |
| **Your Own JWTs**     | App issues internal tokens; Azure AD just handles initial auth |
| **Performance**       | Don't query Azure AD for every user lookup                     |

### What Azure AD Replaces

```
┌─────────────────────────────────────────────────────────────────┐
│                    Authentication Flow                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  BEFORE (Email/Password):                                       │
│  User → Password → Validate locally → Issue JWT                 │
│                                                                 │
│  AFTER (Azure AD SSO):                                          │
│  User → Microsoft Login → Validate Azure token →                │
│  Find/Create local user → Issue your own JWT                    │
│                                                                 │
│  ✓ Azure AD replaces PASSWORD VALIDATION                        │
│  ✗ Azure AD does NOT replace local user records                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Frontend (React + TypeScript)

| Component   | Location                                                         | Purpose                           |
| ----------- | ---------------------------------------------------------------- | --------------------------------- |
| `authStore` | [stores/authStore.ts](front/src/stores/authStore.ts)             | Zustand store for auth state      |
| `authApi`   | [services/api.ts](front/src/services/api.ts)                     | API client for auth endpoints     |
| `useAuth`   | [hooks/useAuth.ts](front/src/hooks/useAuth.ts)                   | Auth hook with login/logout logic |
| `LoginPage` | [pages/Login/LoginPage.tsx](front/src/pages/Login/LoginPage.tsx) | Login UI                          |

---

## 3. Azure AD Integration Strategy

### Recommended Approach: Hybrid Authentication

We recommend implementing **OAuth 2.0/OpenID Connect** with Azure AD while maintaining the existing JWT-based authentication. This approach:

1. **Preserves existing users** - Current email/password users continue to work
2. **Adds SSO capability** - New enterprise users can use Microsoft SSO
3. **Maintains API compatibility** - Backend still issues JWT tokens after SSO authentication
4. **Supports multiple tenants** - Can configure for single-tenant or multi-tenant Azure AD

### Authentication Flow with Azure AD

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Azure AD SSO Flow                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────────────────┐  │
│  │ Frontend │───>│ Azure AD │───>│ Backend  │───>│ Issue Internal JWT   │  │
│  │          │    │  Login   │    │ Callback │    │                      │  │
│  └──────────┘    └──────────┘    └──────────┘    └──────────────────────┘  │
│       │                                                    │               │
│       │               1. Redirect to Azure AD              │               │
│       │               2. User authenticates                │               │
│       │               3. Azure AD returns code/token       │               │
│       │               4. Backend validates & creates user  │               │
│       │               5. Backend issues internal JWT       │               │
│       │<───────────────────────────────────────────────────┘               │
│       │               6. Frontend stores JWT & user info                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Prerequisites

### Azure Portal Setup

1. **Register Application in Azure AD:**

   - Go to [Azure Portal](https://portal.azure.com) → Azure Active Directory → App registrations
   - Click "New registration"
   - Name: `Survey App` (or your preferred name)
   - Supported account types: Choose based on your needs:
     - **Single tenant**: Only users from your organization
     - **Multi-tenant**: Users from any Azure AD organization
     - **Multi-tenant + personal**: Includes personal Microsoft accounts
   - Redirect URI:
     - Type: `Web`
     - URI: `https://your-api-domain.com/api/auth/azure-callback`
     - For development: `http://localhost:5000/api/auth/azure-callback`

2. **Configure Authentication:**

   - Under "Authentication" → Add platform → Web
   - Add redirect URIs for all environments
   - Enable "ID tokens" under Implicit grant and hybrid flows (if using hybrid flow)
   - Enable "Access tokens" if you need to call Microsoft Graph

3. **Create Client Secret:**

   - Under "Certificates & secrets" → New client secret
   - Copy the secret value immediately (shown only once)

4. **API Permissions (Optional - for accessing user data from Microsoft Graph):**

   - Under "API permissions" → Add permission → Microsoft Graph
   - `openid` (required for OIDC)
   - `profile` (to get user's name)
   - `email` (to get user's email)
   - `User.Read` (to read user profile)

5. **Record the following values:**
   - Application (client) ID
   - Directory (tenant) ID
   - Client Secret

---

## 5. Backend Implementation

### Step 5.1: Install Required NuGet Packages

Add to `SurveyApp.Infrastructure.csproj`:

```xml
<ItemGroup>
  <PackageReference Include="Microsoft.AspNetCore.Authentication.OpenIdConnect" Version="8.0.0" />
  <PackageReference Include="Microsoft.Identity.Web" Version="2.17.0" />
</ItemGroup>
```

Or run:

```bash
cd back/src/SurveyApp.Infrastructure
dotnet add package Microsoft.AspNetCore.Authentication.OpenIdConnect
dotnet add package Microsoft.Identity.Web
```

### Step 4.2: Create Azure AD Settings Class

Create `back/src/SurveyApp.Infrastructure/Identity/AzureAdSettings.cs`:

```csharp
namespace SurveyApp.Infrastructure.Identity;

public class AzureAdSettings
{
    public const string SectionName = "AzureAd";

    public string Instance { get; set; } = "https://login.microsoftonline.com/";
    public string TenantId { get; set; } = string.Empty;
    public string ClientId { get; set; } = string.Empty;
    public string ClientSecret { get; set; } = string.Empty;
    public string CallbackPath { get; set; } = "/api/auth/azure-callback";
    public string Domain { get; set; } = string.Empty;

    /// <summary>
    /// If true, only users from the configured tenant can sign in.
    /// If false, users from any Azure AD tenant can sign in.
    /// </summary>
    public bool SingleTenant { get; set; } = true;

    /// <summary>
    /// If true, automatically create local user accounts for Azure AD users.
    /// </summary>
    public bool AutoProvisionUsers { get; set; } = true;

    public string Authority => SingleTenant
        ? $"{Instance}{TenantId}/v2.0"
        : $"{Instance}common/v2.0";
}
```

### Step 4.3: Update ApplicationUser Entity

Modify `back/src/SurveyApp.Infrastructure/Identity/ApplicationUser.cs`:

```csharp
using Microsoft.AspNetCore.Identity;

namespace SurveyApp.Infrastructure.Identity;

public class ApplicationUser : IdentityUser
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public Guid DomainUserId { get; set; }
    public string? RefreshToken { get; set; }
    public DateTime RefreshTokenExpiryTime { get; set; }

    // Azure AD SSO Properties
    public string? AzureAdObjectId { get; set; }
    public string? AzureAdTenantId { get; set; }
    public bool IsExternalUser { get; set; } = false;
    public string? ExternalProvider { get; set; } // "AzureAD", "Google", etc.
    public DateTime? LastExternalLogin { get; set; }
}
```

### Step 4.4: Create Azure AD Authentication Command

Create `back/src/SurveyApp.Application/Features/Auth/Commands/AzureAdLogin/AzureAdLoginCommand.cs`:

```csharp
using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.DTOs;

namespace SurveyApp.Application.Features.Auth.Commands.AzureAdLogin;

public record AzureAdLoginCommand(
    string IdToken,
    string? AccessToken = null
) : IRequest<Result<AuthResponseDto>>;
```

Create `back/src/SurveyApp.Application/Features/Auth/Commands/AzureAdLogin/AzureAdLoginCommandHandler.cs`:

```csharp
using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;

namespace SurveyApp.Application.Features.Auth.Commands.AzureAdLogin;

public class AzureAdLoginCommandHandler(IIdentityService identityService)
    : IRequestHandler<AzureAdLoginCommand, Result<AuthResponseDto>>
{
    private readonly IIdentityService _identityService = identityService;

    public async Task<Result<AuthResponseDto>> Handle(
        AzureAdLoginCommand request,
        CancellationToken cancellationToken
    )
    {
        var result = await _identityService.AuthenticateWithAzureAdAsync(
            request.IdToken,
            request.AccessToken
        );

        if (!result.Succeeded)
        {
            var error = result.Errors.FirstOrDefault() ?? "Errors.AzureAdAuthenticationFailed";
            return Result<AuthResponseDto>.Failure(error, "UNAUTHORIZED");
        }

        return Result<AuthResponseDto>.Success(
            new AuthResponseDto
            {
                Token = result.Token!,
                RefreshToken = result.RefreshToken!,
                ExpiresAt = result.ExpiresAt!.Value,
                User = new AuthUserDto
                {
                    Id = result.UserId!,
                    Email = result.Email!,
                    FirstName = result.FirstName!,
                    LastName = result.LastName!,
                    FullName = result.FullName!,
                    EmailConfirmed = result.EmailConfirmed,
                    AvatarUrl = result.AvatarUrl,
                    ProfilePictureUrl = result.ProfilePictureUrl,
                    LastLoginAt = result.LastLoginAt,
                    IsActive = result.IsActive,
                    CreatedAt = result.CreatedAt,
                    UpdatedAt = result.UpdatedAt,
                },
            }
        );
    }
}
```

### Step 4.5: Update IIdentityService Interface

Update `back/src/SurveyApp.Application/Common/Interfaces/IIdentityService.cs`:

```csharp
namespace SurveyApp.Application.Common.Interfaces;

/// <summary>
/// Service for handling user identity operations (authentication, registration, etc.)
/// </summary>
public interface IIdentityService
{
    // Existing methods...
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

    // New Azure AD methods
    Task<AuthenticationResult> AuthenticateWithAzureAdAsync(
        string idToken,
        string? accessToken = null
    );
    Task<AuthenticationResult> LinkAzureAdAccountAsync(
        string userId,
        string azureAdObjectId,
        string azureAdTenantId
    );
    Task<bool> UnlinkAzureAdAccountAsync(string userId);
}
```

### Step 4.6: Implement Azure AD Authentication in IdentityService

Add to `back/src/SurveyApp.Infrastructure/Identity/IdentityService.cs`:

```csharp
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Microsoft.IdentityModel.Protocols;
using Microsoft.IdentityModel.Protocols.OpenIdConnect;
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
    IOptions<AzureAdSettings> azureAdSettings  // Add this
) : IIdentityService
{
    private readonly UserManager<ApplicationUser> _userManager = userManager;
    private readonly SignInManager<ApplicationUser> _signInManager = signInManager;
    private readonly IUserRepository _userRepository = userRepository;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;
    private readonly JwtSettings _jwtSettings = jwtSettings.Value;
    private readonly AzureAdSettings _azureAdSettings = azureAdSettings.Value;  // Add this

    // ... existing methods ...

    public async Task<AuthenticationResult> AuthenticateWithAzureAdAsync(
        string idToken,
        string? accessToken = null
    )
    {
        try
        {
            // Validate the Azure AD token
            var validatedToken = await ValidateAzureAdTokenAsync(idToken);
            if (validatedToken == null)
            {
                return AuthenticationResult.Failure("Infrastructure.Identity.InvalidAzureAdToken");
            }

            // Extract claims from the token
            var azureAdObjectId = validatedToken.Claims
                .FirstOrDefault(c => c.Type == "oid" || c.Type == ClaimTypes.NameIdentifier)?.Value;
            var azureAdTenantId = validatedToken.Claims
                .FirstOrDefault(c => c.Type == "tid")?.Value;
            var email = validatedToken.Claims
                .FirstOrDefault(c => c.Type == "email" || c.Type == "preferred_username" || c.Type == ClaimTypes.Email)?.Value;
            var firstName = validatedToken.Claims
                .FirstOrDefault(c => c.Type == "given_name" || c.Type == ClaimTypes.GivenName)?.Value ?? "";
            var lastName = validatedToken.Claims
                .FirstOrDefault(c => c.Type == "family_name" || c.Type == ClaimTypes.Surname)?.Value ?? "";
            var displayName = validatedToken.Claims
                .FirstOrDefault(c => c.Type == "name")?.Value;

            if (string.IsNullOrEmpty(email) || string.IsNullOrEmpty(azureAdObjectId))
            {
                return AuthenticationResult.Failure("Infrastructure.Identity.MissingAzureAdClaims");
            }

            // Check tenant restriction if configured
            if (_azureAdSettings.SingleTenant &&
                !string.IsNullOrEmpty(_azureAdSettings.TenantId) &&
                azureAdTenantId != _azureAdSettings.TenantId)
            {
                return AuthenticationResult.Failure("Infrastructure.Identity.TenantNotAllowed");
            }

            // Find existing user by Azure AD Object ID or email
            var user = await FindUserByAzureAdIdOrEmailAsync(azureAdObjectId, email);

            if (user == null)
            {
                if (!_azureAdSettings.AutoProvisionUsers)
                {
                    return AuthenticationResult.Failure("Infrastructure.Identity.UserNotProvisioned");
                }

                // Auto-provision new user
                user = await CreateAzureAdUserAsync(
                    email,
                    firstName,
                    lastName,
                    azureAdObjectId,
                    azureAdTenantId!
                );

                if (user == null)
                {
                    return AuthenticationResult.Failure("Infrastructure.Identity.UserProvisioningFailed");
                }
            }
            else if (string.IsNullOrEmpty(user.AzureAdObjectId))
            {
                // Link existing email user to Azure AD
                user.AzureAdObjectId = azureAdObjectId;
                user.AzureAdTenantId = azureAdTenantId;
                user.IsExternalUser = true;
                user.ExternalProvider = "AzureAD";
                user.EmailConfirmed = true; // Azure AD emails are verified
                await _userManager.UpdateAsync(user);
            }

            // Update last external login
            user.LastExternalLogin = DateTime.UtcNow;
            await _userManager.UpdateAsync(user);

            return await GenerateAuthenticationResultAsync(user);
        }
        catch (Exception ex)
        {
            // Log the exception
            return AuthenticationResult.Failure($"Infrastructure.Identity.AzureAdAuthError: {ex.Message}");
        }
    }

    private async Task<JwtSecurityToken?> ValidateAzureAdTokenAsync(string idToken)
    {
        var configManager = new ConfigurationManager<OpenIdConnectConfiguration>(
            $"{_azureAdSettings.Authority}/.well-known/openid-configuration",
            new OpenIdConnectConfigurationRetriever()
        );

        var config = await configManager.GetConfigurationAsync();

        var validationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuers = new[]
            {
                $"https://login.microsoftonline.com/{_azureAdSettings.TenantId}/v2.0",
                $"https://sts.windows.net/{_azureAdSettings.TenantId}/",
                "https://login.microsoftonline.com/common/v2.0" // For multi-tenant
            },
            ValidateAudience = true,
            ValidAudiences = new[] { _azureAdSettings.ClientId },
            ValidateLifetime = true,
            IssuerSigningKeys = config.SigningKeys,
            ValidateIssuerSigningKey = true,
        };

        var tokenHandler = new JwtSecurityTokenHandler();

        try
        {
            tokenHandler.ValidateToken(idToken, validationParameters, out var validatedToken);
            return validatedToken as JwtSecurityToken;
        }
        catch
        {
            return null;
        }
    }

    private async Task<ApplicationUser?> FindUserByAzureAdIdOrEmailAsync(
        string azureAdObjectId,
        string email
    )
    {
        // First try to find by Azure AD Object ID
        var users = _userManager.Users
            .Where(u => u.AzureAdObjectId == azureAdObjectId)
            .ToList();

        var user = users.FirstOrDefault();

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
            return null;
        }

        // Create domain user
        var domainUser = User.Create(emailVo.Value, string.Empty, firstName, lastName);
        domainUser.ConfirmEmail(); // Azure AD users are pre-verified
        await _userRepository.AddAsync(domainUser);

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
            return null;
        }

        await _unitOfWork.SaveChangesAsync();
        return identityUser;
    }

    public async Task<AuthenticationResult> LinkAzureAdAccountAsync(
        string userId,
        string azureAdObjectId,
        string azureAdTenantId
    )
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            return AuthenticationResult.Failure("Infrastructure.Identity.UserNotFound");
        }

        // Check if Azure AD account is already linked to another user
        var existingUser = _userManager.Users
            .FirstOrDefault(u => u.AzureAdObjectId == azureAdObjectId && u.Id != userId);

        if (existingUser != null)
        {
            return AuthenticationResult.Failure("Infrastructure.Identity.AzureAdAccountAlreadyLinked");
        }

        user.AzureAdObjectId = azureAdObjectId;
        user.AzureAdTenantId = azureAdTenantId;
        user.IsExternalUser = true;
        user.ExternalProvider = "AzureAD";

        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
        {
            return AuthenticationResult.Failure("Infrastructure.Identity.AccountLinkingFailed");
        }

        return await GenerateAuthenticationResultAsync(user);
    }

    public async Task<bool> UnlinkAzureAdAccountAsync(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            return false;
        }

        // Only allow unlinking if user has a password set
        var hasPassword = await _userManager.HasPasswordAsync(user);
        if (!hasPassword)
        {
            return false; // Can't unlink if no alternative login method
        }

        user.AzureAdObjectId = null;
        user.AzureAdTenantId = null;
        user.IsExternalUser = false;
        user.ExternalProvider = null;

        var result = await _userManager.UpdateAsync(user);
        return result.Succeeded;
    }

    // ... rest of existing methods ...
}
```

### Step 4.7: Update DependencyInjection

Update `back/src/SurveyApp.Infrastructure/DependencyInjection.cs`:

```csharp
// Add after JWT configuration
// Azure AD Authentication (optional - only if configured)
var azureAdSettings = new AzureAdSettings();
configuration.Bind(AzureAdSettings.SectionName, azureAdSettings);

if (!string.IsNullOrEmpty(azureAdSettings.ClientId))
{
    services.Configure<AzureAdSettings>(configuration.GetSection(AzureAdSettings.SectionName));

    // Add OpenID Connect for Azure AD
    services.AddAuthentication()
        .AddOpenIdConnect("AzureAD", options =>
        {
            options.Authority = azureAdSettings.Authority;
            options.ClientId = azureAdSettings.ClientId;
            options.ClientSecret = azureAdSettings.ClientSecret;
            options.ResponseType = "code";
            options.SaveTokens = true;
            options.GetClaimsFromUserInfoEndpoint = true;
            options.Scope.Add("openid");
            options.Scope.Add("profile");
            options.Scope.Add("email");
            options.CallbackPath = azureAdSettings.CallbackPath;
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = azureAdSettings.SingleTenant,
                NameClaimType = "name",
            };
        });
}
else
{
    // Register dummy settings if Azure AD is not configured
    services.Configure<AzureAdSettings>(_ => { });
}
```

### Step 4.8: Add Azure AD Controller Endpoints

Update `back/src/SurveyApp.API/Controllers/AuthController.cs`:

```csharp
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SurveyApp.Application.DTOs;
using SurveyApp.Application.Features.Auth.Commands.AzureAdLogin;
using SurveyApp.Application.Features.Auth.Commands.ForgotPassword;
using SurveyApp.Application.Features.Auth.Commands.Login;
using SurveyApp.Application.Features.Auth.Commands.Logout;
using SurveyApp.Application.Features.Auth.Commands.RefreshToken;
using SurveyApp.Application.Features.Auth.Commands.Register;
using SurveyApp.Application.Features.Auth.Commands.ResetPassword;

namespace SurveyApp.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(IMediator mediator, IConfiguration configuration) : ApiControllerBase
{
    private readonly IMediator _mediator = mediator;
    private readonly IConfiguration _configuration = configuration;

    // ... existing endpoints ...

    /// <summary>
    /// Get Azure AD configuration for frontend
    /// </summary>
    [HttpGet("azure-ad/config")]
    [ProducesResponseType(typeof(AzureAdConfigDto), StatusCodes.Status200OK)]
    public IActionResult GetAzureAdConfig()
    {
        var clientId = _configuration["AzureAd:ClientId"];
        var tenantId = _configuration["AzureAd:TenantId"];
        var singleTenant = _configuration.GetValue<bool>("AzureAd:SingleTenant", true);

        if (string.IsNullOrEmpty(clientId))
        {
            return Ok(new AzureAdConfigDto { Enabled = false });
        }

        return Ok(new AzureAdConfigDto
        {
            Enabled = true,
            ClientId = clientId,
            TenantId = tenantId,
            Authority = singleTenant
                ? $"https://login.microsoftonline.com/{tenantId}"
                : "https://login.microsoftonline.com/common",
            RedirectUri = $"{Request.Scheme}://{Request.Host}/auth/azure-callback",
            Scopes = new[] { "openid", "profile", "email" }
        });
    }

    /// <summary>
    /// Authenticate with Azure AD token
    /// </summary>
    [HttpPost("azure-ad/login")]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> AzureAdLogin([FromBody] AzureAdLoginCommand command)
    {
        var result = await _mediator.Send(command);
        return HandleResult(result);
    }

    /// <summary>
    /// Link Azure AD account to existing user
    /// </summary>
    [HttpPost("azure-ad/link")]
    [Authorize]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> LinkAzureAdAccount([FromBody] LinkAzureAdCommand command)
    {
        var result = await _mediator.Send(command);
        return HandleResult(result);
    }

    /// <summary>
    /// Unlink Azure AD account from user
    /// </summary>
    [HttpPost("azure-ad/unlink")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> UnlinkAzureAdAccount()
    {
        var result = await _mediator.Send(new UnlinkAzureAdCommand());
        return HandleNoContentResult(result);
    }
}

public record AzureAdConfigDto
{
    public bool Enabled { get; init; }
    public string? ClientId { get; init; }
    public string? TenantId { get; init; }
    public string? Authority { get; init; }
    public string? RedirectUri { get; init; }
    public string[]? Scopes { get; init; }
}
```

---

## 6. Frontend Implementation

### Step 5.1: Install MSAL Library

```bash
cd front
npm install @azure/msal-browser @azure/msal-react
```

### Step 5.2: Create MSAL Configuration

Create `front/src/config/msalConfig.ts`:

```typescript
import { Configuration, LogLevel, PublicClientApplication } from '@azure/msal-browser';

export interface AzureAdConfig {
  enabled: boolean;
  clientId?: string;
  tenantId?: string;
  authority?: string;
  redirectUri?: string;
  scopes?: string[];
}

// This will be populated from the backend
let azureAdConfig: AzureAdConfig = { enabled: false };

export const setAzureAdConfig = (config: AzureAdConfig) => {
  azureAdConfig = config;
};

export const getAzureAdConfig = (): AzureAdConfig => azureAdConfig;

export const createMsalConfig = (config: AzureAdConfig): Configuration => ({
  auth: {
    clientId: config.clientId || '',
    authority: config.authority || 'https://login.microsoftonline.com/common',
    redirectUri: config.redirectUri || window.location.origin + '/auth/azure-callback',
    postLogoutRedirectUri: window.location.origin,
    navigateToLoginRequestUrl: true,
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) return;
        switch (level) {
          case LogLevel.Error:
            console.error(message);
            break;
          case LogLevel.Warning:
            console.warn(message);
            break;
          case LogLevel.Info:
            console.info(message);
            break;
          case LogLevel.Verbose:
            console.debug(message);
            break;
        }
      },
      logLevel: LogLevel.Warning,
    },
  },
});

export const loginRequest = {
  scopes: ['openid', 'profile', 'email'],
};

let msalInstance: PublicClientApplication | null = null;

export const getMsalInstance = (): PublicClientApplication | null => msalInstance;

export const initializeMsal = async (config: AzureAdConfig): Promise<PublicClientApplication | null> => {
  if (!config.enabled || !config.clientId) {
    return null;
  }

  try {
    msalInstance = new PublicClientApplication(createMsalConfig(config));
    await msalInstance.initialize();
    return msalInstance;
  } catch (error) {
    console.error('Failed to initialize MSAL:', error);
    return null;
  }
};
```

### Step 5.3: Create Azure AD Auth Hook

Create `front/src/hooks/useAzureAuth.ts`:

```typescript
import { useState, useCallback, useEffect } from 'react';
import { useMsal, useIsAuthenticated } from '@azure/msal-react';
import { InteractionStatus, AccountInfo, AuthenticationResult } from '@azure/msal-browser';
import { getAzureAdConfig, loginRequest } from '@/config/msalConfig';
import { authApi } from '@/services';
import { useAuthStore } from '@/stores';
import { toast } from '@/components/ui';

interface UseAzureAuthReturn {
  isAzureAdEnabled: boolean;
  isLoading: boolean;
  error: string | null;
  loginWithAzureAd: () => Promise<void>;
  handleAzureAdCallback: () => Promise<void>;
  getAzureAdAccount: () => AccountInfo | null;
}

export function useAzureAuth(): UseAzureAuthReturn {
  const { instance, accounts, inProgress } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const { login: setAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const config = getAzureAdConfig();
  const isAzureAdEnabled = config.enabled;

  const loginWithAzureAd = useCallback(async () => {
    if (!isAzureAdEnabled || inProgress !== InteractionStatus.None) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Use popup for login (alternatively, use redirect)
      const response = await instance.loginPopup(loginRequest);
      await handleAuthResponse(response);
    } catch (err: any) {
      const errorMessage = err.errorMessage || 'Azure AD login failed';
      setError(errorMessage);
      toast.error('Login failed', { description: errorMessage });
    } finally {
      setIsLoading(false);
    }
  }, [instance, isAzureAdEnabled, inProgress]);

  const handleAuthResponse = async (response: AuthenticationResult) => {
    if (!response.idToken) {
      throw new Error('No ID token received from Azure AD');
    }

    // Send the token to our backend to get our own JWT
    const authResponse = await authApi.azureAdLogin({
      idToken: response.idToken,
      accessToken: response.accessToken,
    });

    // Store our JWT and user data
    setAuth(authResponse.user, authResponse.tokens);
    toast.success('Welcome!', { description: `Signed in as ${authResponse.user.email}` });
  };

  const handleAzureAdCallback = useCallback(async () => {
    if (inProgress !== InteractionStatus.None) {
      return;
    }

    try {
      const response = await instance.handleRedirectPromise();
      if (response) {
        await handleAuthResponse(response);
      }
    } catch (err: any) {
      console.error('Azure AD callback error:', err);
      setError(err.message);
    }
  }, [instance, inProgress]);

  const getAzureAdAccount = useCallback((): AccountInfo | null => {
    return accounts[0] || null;
  }, [accounts]);

  return {
    isAzureAdEnabled,
    isLoading: isLoading || inProgress !== InteractionStatus.None,
    error,
    loginWithAzureAd,
    handleAzureAdCallback,
    getAzureAdAccount,
  };
}
```

### Step 5.4: Update API Service

Add to `front/src/services/api.ts`:

```typescript
// Add to authApi object
export const authApi = {
  // ... existing methods ...

  getAzureAdConfig: async (): Promise<AzureAdConfig> => {
    const response = await apiClient.get<AzureAdConfig>(API_ENDPOINTS.auth.azureAdConfig);
    return response.data;
  },

  azureAdLogin: async (data: { idToken: string; accessToken?: string }): Promise<LoginResponse> => {
    const response = await apiClient.post<RawAuthResponse>(API_ENDPOINTS.auth.azureAdLogin, data);
    return transformAuthResponse(response.data);
  },

  linkAzureAd: async (data: { idToken: string }): Promise<LoginResponse> => {
    const response = await apiClient.post<RawAuthResponse>(API_ENDPOINTS.auth.linkAzureAd, data);
    return transformAuthResponse(response.data);
  },

  unlinkAzureAd: async (): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.auth.unlinkAzureAd);
  },
};

// Add to API_ENDPOINTS in config/api.ts
export const API_ENDPOINTS = {
  auth: {
    // ... existing endpoints ...
    azureAdConfig: '/api/auth/azure-ad/config',
    azureAdLogin: '/api/auth/azure-ad/login',
    linkAzureAd: '/api/auth/azure-ad/link',
    unlinkAzureAd: '/api/auth/azure-ad/unlink',
  },
  // ...
};
```

### Step 5.5: Create Azure AD Login Button Component

Create `front/src/components/ui/AzureAdLoginButton.tsx`:

```tsx
import { useAzureAuth } from '@/hooks/useAzureAuth';
import { Button } from '@/components/ui';
import { useTranslation } from 'react-i18next';

interface AzureAdLoginButtonProps {
  className?: string;
  fullWidth?: boolean;
}

export function AzureAdLoginButton({ className, fullWidth }: AzureAdLoginButtonProps) {
  const { t } = useTranslation();
  const { isAzureAdEnabled, isLoading, loginWithAzureAd } = useAzureAuth();

  if (!isAzureAdEnabled) {
    return null;
  }

  return (
    <Button type='button' variant='outline' onClick={loginWithAzureAd} disabled={isLoading} className={className} fullWidth={fullWidth}>
      <svg className='mr-2 h-4 w-4' viewBox='0 0 21 21' xmlns='http://www.w3.org/2000/svg'>
        <rect x='1' y='1' width='9' height='9' fill='#f25022' />
        <rect x='11' y='1' width='9' height='9' fill='#7fba00' />
        <rect x='1' y='11' width='9' height='9' fill='#00a4ef' />
        <rect x='11' y='11' width='9' height='9' fill='#ffb900' />
      </svg>
      {isLoading ? t('auth.signingIn') : t('auth.signInWithMicrosoft')}
    </Button>
  );
}
```

### Step 5.6: Update Login Page

Update `front/src/pages/Login/LoginPage.tsx` to include the SSO button:

```tsx
import { AzureAdLoginButton } from '@/components/ui/AzureAdLoginButton';

// In the JSX, add after the login form or as an alternative:
<div className='mt-6'>
  <div className='relative'>
    <div className='absolute inset-0 flex items-center'>
      <div className='w-full border-t border-gray-300' />
    </div>
    <div className='relative flex justify-center text-sm'>
      <span className='bg-white px-2 text-gray-500'>{t('auth.orContinueWith')}</span>
    </div>
  </div>

  <div className='mt-6'>
    <AzureAdLoginButton fullWidth />
  </div>
</div>;
```

### Step 5.7: Create Azure AD Callback Page

Create `front/src/pages/AzureCallback/AzureCallbackPage.tsx`:

```tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAzureAuth } from '@/hooks/useAzureAuth';
import { Spinner } from '@/components/ui';

export function AzureCallbackPage() {
  const navigate = useNavigate();
  const { handleAzureAdCallback, error } = useAzureAuth();

  useEffect(() => {
    handleAzureAdCallback().then(() => {
      navigate('/', { replace: true });
    });
  }, [handleAzureAdCallback, navigate]);

  if (error) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='text-center'>
          <h1 className='text-xl font-semibold text-red-600'>Authentication Failed</h1>
          <p className='mt-2 text-gray-600'>{error}</p>
          <button onClick={() => navigate('/login')} className='mt-4 text-primary hover:underline'>
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='flex min-h-screen items-center justify-center'>
      <div className='text-center'>
        <Spinner size='lg' />
        <p className='mt-4 text-gray-600'>Completing sign in...</p>
      </div>
    </div>
  );
}
```

### Step 5.8: Update App Router

Add the callback route to your router configuration:

```tsx
// In your router configuration
{
  path: '/auth/azure-callback',
  element: <AzureCallbackPage />,
}
```

### Step 5.9: Initialize MSAL on App Start

Update `front/src/App.tsx`:

```tsx
import { useEffect, useState } from 'react';
import { MsalProvider } from '@azure/msal-react';
import { PublicClientApplication } from '@azure/msal-browser';
import { authApi } from '@/services';
import { initializeMsal, setAzureAdConfig, getMsalInstance } from '@/config/msalConfig';

function App() {
  const [msalInstance, setMsalInstance] = useState<PublicClientApplication | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initAzureAd = async () => {
      try {
        const config = await authApi.getAzureAdConfig();
        setAzureAdConfig(config);

        if (config.enabled) {
          const instance = await initializeMsal(config);
          setMsalInstance(instance);
        }
      } catch (error) {
        console.warn('Azure AD not configured:', error);
      } finally {
        setIsInitialized(true);
      }
    };

    initAzureAd();
  }, []);

  if (!isInitialized) {
    return <LoadingScreen />;
  }

  // Wrap with MsalProvider only if Azure AD is enabled
  const content = <RouterProvider router={router} />;

  if (msalInstance) {
    return <MsalProvider instance={msalInstance}>{content}</MsalProvider>;
  }

  return content;
}
```

---

## 7. Database Migrations

### Step 7.1: Consolidate to One Database with Schemas

First, update the connection strings to use one database with schema separation.

Update `back/src/SurveyApp.API/appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=surveyapp;Username=postgres;Password=admin1234;SearchPath=public",
    "IdentityConnection": "Host=localhost;Port=5432;Database=surveyapp;Username=postgres;Password=admin1234;SearchPath=identity"
  }
}
```

### Step 7.2: Create Identity Schema

Create a migration to set up the identity schema. Add to `ApplicationIdentityDbContext`:

```csharp
// In ApplicationIdentityDbContext.cs
protected override void OnModelCreating(ModelBuilder builder)
{
    base.OnModelCreating(builder);

    // Use 'identity' schema for all Identity tables
    builder.HasDefaultSchema("identity");
}
```

### Step 7.3: Create Schema via SQL (if needed)

If you're migrating existing data, run this SQL first:

```sql
-- Create the identity schema
CREATE SCHEMA IF NOT EXISTS identity;

-- Move existing identity tables to the new schema (if they exist in public)
-- ALTER TABLE public."AspNetUsers" SET SCHEMA identity;
-- ALTER TABLE public."AspNetRoles" SET SCHEMA identity;
-- etc.
```

### Step 7.4: Add Azure AD Fields Migration

Run in terminal:

```bash
cd back/src/SurveyApp.Infrastructure
dotnet ef migrations add AddAzureAdFields -c ApplicationIdentityDbContext --startup-project ../SurveyApp.API
```

This will create a migration for the new `ApplicationUser` fields:

- `AzureAdObjectId`
- `AzureAdTenantId`
- `IsExternalUser`
- `ExternalProvider`
- `LastExternalLogin`

### Step 7.5: Apply Migration

```bash
dotnet ef database update -c ApplicationIdentityDbContext --startup-project ../SurveyApp.API
```

### Step 7.6: Update Docker Compose (if using Docker)

Update `docker-compose.yml` to use single database:

```yaml
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: surveyapp
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: admin1234
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./docker/postgres/init-schemas.sql:/docker-entrypoint-initdb.d/init-schemas.sql
    ports:
      - '5432:5432'
```

Create `docker/postgres/init-schemas.sql`:

```sql
-- Create schemas for logical separation
CREATE SCHEMA IF NOT EXISTS identity;

-- Grant permissions
GRANT ALL ON SCHEMA identity TO postgres;
GRANT ALL ON SCHEMA public TO postgres;
```

---

## 8. Configuration

### Step 8.1: Update appsettings.json

Add Azure AD configuration to `back/src/SurveyApp.API/appsettings.json`:

```json
{
  "AzureAd": {
    "Instance": "https://login.microsoftonline.com/",
    "TenantId": "YOUR_TENANT_ID",
    "ClientId": "YOUR_CLIENT_ID",
    "ClientSecret": "YOUR_CLIENT_SECRET",
    "CallbackPath": "/api/auth/azure-callback",
    "Domain": "yourcompany.onmicrosoft.com",
    "SingleTenant": true,
    "AutoProvisionUsers": true
  }
}
```

### Step 8.2: Use User Secrets for Development

```bash
cd back/src/SurveyApp.API
dotnet user-secrets set "AzureAd:TenantId" "your-tenant-id"
dotnet user-secrets set "AzureAd:ClientId" "your-client-id"
dotnet user-secrets set "AzureAd:ClientSecret" "your-client-secret"
```

### Step 8.3: Production Environment Variables

For production, set environment variables:

```bash
AzureAd__TenantId=your-tenant-id
AzureAd__ClientId=your-client-id
AzureAd__ClientSecret=your-client-secret
```

---

## 9. Testing

### Step 9.1: Manual Testing Checklist

- [ ] Azure AD login button appears on login page
- [ ] Clicking "Sign in with Microsoft" opens Azure AD login
- [ ] After Azure AD auth, user is redirected back and logged in
- [ ] New Azure AD users are auto-provisioned
- [ ] Existing email users can link their Azure AD account
- [ ] Users can still login with email/password
- [ ] Token refresh works for Azure AD users
- [ ] Logout works for Azure AD users

### Step 9.2: Integration Tests

Create `back/tests/SurveyApp.IntegrationTests/Auth/AzureAdAuthTests.cs`:

```csharp
[Fact]
public async Task AuthenticateWithAzureAd_ValidToken_ReturnsAuthResult()
{
    // Arrange
    var mockIdToken = GenerateMockAzureAdToken();

    // Act
    var result = await _identityService.AuthenticateWithAzureAdAsync(mockIdToken);

    // Assert
    Assert.True(result.Succeeded);
    Assert.NotNull(result.Token);
    Assert.NotNull(result.UserId);
}
```

---

## 10. Security Considerations

### 9.1: Token Validation

- Always validate Azure AD tokens on the backend
- Use the OpenID Connect configuration endpoint for signing keys
- Validate issuer, audience, and token lifetime

### 9.2: Tenant Restrictions

- For enterprise deployment, enable `SingleTenant: true`
- This ensures only users from your organization can sign in

### 9.3: Secure Secrets

- Never commit Azure AD client secrets to source control
- Use Azure Key Vault in production
- Rotate client secrets periodically

### 9.4: CORS Configuration

Ensure CORS allows the Azure AD callback URL:

```csharp
// In Program.cs
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
            "http://localhost:5173",
            "https://your-production-domain.com"
        )
        .AllowAnyMethod()
        .AllowAnyHeader()
        .AllowCredentials();
    });
});
```

---

## 11. Rollout Strategy

### Phase 1: Development (Week 1)

- [ ] Implement backend Azure AD authentication
- [ ] Create database migrations
- [ ] Set up test Azure AD app registration

### Phase 2: Frontend Integration (Week 2)

- [ ] Install MSAL library
- [ ] Create Azure AD login components
- [ ] Update login page UI
- [ ] Implement callback handling

### Phase 3: Testing (Week 3)

- [ ] Internal testing with test Azure AD tenant
- [ ] Security review
- [ ] Performance testing

### Phase 4: Production Deployment (Week 4)

- [ ] Create production Azure AD app registration
- [ ] Configure production secrets
- [ ] Deploy to staging environment
- [ ] Final QA testing

### Phase 5: Go Live

- [ ] Deploy to production
- [ ] Monitor authentication logs
- [ ] Provide user documentation
- [ ] Support team training

---

## Summary

This integration adds Azure AD SSO capability while maintaining full backward compatibility with existing email/password authentication. The hybrid approach allows:

1. **Existing users** continue using email/password
2. **New enterprise users** can use Microsoft SSO
3. **Existing users** can optionally link their Azure AD accounts
4. **Administrators** can control user provisioning behavior

Key files to create/modify:

- `AzureAdSettings.cs` - Configuration class
- `ApplicationUser.cs` - Add Azure AD fields
- `IIdentityService.cs` - Add new methods
- `IdentityService.cs` - Implement Azure AD auth
- `AuthController.cs` - Add new endpoints
- `msalConfig.ts` - Frontend MSAL configuration
- `useAzureAuth.ts` - Frontend auth hook
- `AzureAdLoginButton.tsx` - UI component

For questions or issues during implementation, refer to:

- [Microsoft Identity Platform Documentation](https://docs.microsoft.com/en-us/azure/active-directory/develop/)
- [MSAL.js Documentation](https://github.com/AzureAD/microsoft-authentication-library-for-js)
- [ASP.NET Core Authentication Docs](https://docs.microsoft.com/en-us/aspnet/core/security/authentication/)
