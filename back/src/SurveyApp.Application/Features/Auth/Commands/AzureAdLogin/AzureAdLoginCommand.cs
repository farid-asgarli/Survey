using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.DTOs;

namespace SurveyApp.Application.Features.Auth.Commands.AzureAdLogin;

/// <summary>
/// Command to authenticate a user via Azure AD Single Sign-On.
/// The ID token is validated and the user is either found/created.
/// </summary>
public record AzureAdLoginCommand : IRequest<Result<AuthResponseDto>>
{
    /// <summary>
    /// The ID token received from Azure AD authentication.
    /// This token contains the user's identity claims.
    /// </summary>
    public required string IdToken { get; init; }

    /// <summary>
    /// Optional access token from Azure AD.
    /// Can be used for additional Microsoft Graph API calls.
    /// </summary>
    public string? AccessToken { get; init; }
}
