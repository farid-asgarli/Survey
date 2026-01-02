using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.DTOs;

namespace SurveyApp.Application.Features.Auth.Commands.LinkAzureAd;

/// <summary>
/// Command to link an Azure AD account to an existing user.
/// Allows users who registered with email/password to add SSO capability.
/// </summary>
public record LinkAzureAdCommand : IRequest<Result<AuthResponseDto>>
{
    /// <summary>
    /// The ID token from Azure AD authentication for the account to link.
    /// </summary>
    public required string IdToken { get; init; }
}
