using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;

namespace SurveyApp.Application.Features.Auth.Queries.GetAzureAdConfig;

/// <summary>
/// Handler for retrieving Azure AD configuration.
/// </summary>
public class GetAzureAdConfigQueryHandler(IAzureAdConfigService azureAdConfigService)
    : IRequestHandler<GetAzureAdConfigQuery, Result<AzureAdConfigDto>>
{
    private readonly IAzureAdConfigService _azureAdConfigService = azureAdConfigService;

    public Task<Result<AzureAdConfigDto>> Handle(
        GetAzureAdConfigQuery request,
        CancellationToken cancellationToken
    )
    {
        var config = _azureAdConfigService.GetConfiguration(request.FrontendBaseUrl);
        return Task.FromResult(Result<AzureAdConfigDto>.Success(config));
    }
}
