using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.DTOs;

namespace SurveyApp.Application.Features.Auth.Queries.GetAzureAdConfig;

/// <summary>
/// Query to retrieve Azure AD configuration for frontend MSAL initialization.
/// </summary>
public record GetAzureAdConfigQuery(string FrontendBaseUrl) : IRequest<Result<AzureAdConfigDto>>;
