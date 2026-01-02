using MediatR;
using SurveyApp.Application.Common;

namespace SurveyApp.Application.Features.Auth.Commands.UnlinkAzureAd;

/// <summary>
/// Command to unlink an Azure AD account from the current user.
/// Requires the user to have a password set as an alternative login method.
/// </summary>
public record UnlinkAzureAdCommand : IRequest<Result<Unit>>;
