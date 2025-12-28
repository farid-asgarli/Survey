using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Domain.Interfaces;

namespace SurveyApp.Application.Features.EmailDistributions.Queries.GetDistributionStats;

public class GetDistributionStatsQueryHandler(
    IEmailDistributionRepository distributionRepository,
    INamespaceContext namespaceContext
) : IRequestHandler<GetDistributionStatsQuery, Result<DistributionStatsDto>>
{
    private readonly IEmailDistributionRepository _distributionRepository = distributionRepository;
    private readonly INamespaceContext _namespaceContext = namespaceContext;

    public async Task<Result<DistributionStatsDto>> Handle(
        GetDistributionStatsQuery request,
        CancellationToken cancellationToken
    )
    {
        var namespaceId = _namespaceContext.CurrentNamespaceId;
        if (!namespaceId.HasValue)
        {
            return Result<DistributionStatsDto>.Failure("Errors.NamespaceRequired");
        }

        var distribution = await _distributionRepository.GetByIdAsync(
            request.DistributionId,
            cancellationToken
        );

        if (distribution == null || distribution.NamespaceId != namespaceId.Value)
        {
            return Result<DistributionStatsDto>.Failure("Errors.DistributionNotFound");
        }

        var stats = new DistributionStatsDto
        {
            TotalRecipients = distribution.TotalRecipients,
            SentCount = distribution.SentCount,
            DeliveredCount = distribution.DeliveredCount,
            OpenedCount = distribution.OpenedCount,
            ClickedCount = distribution.ClickedCount,
            BouncedCount = distribution.BouncedCount,
            UnsubscribedCount = distribution.UnsubscribedCount,
        };

        return Result<DistributionStatsDto>.Success(stats);
    }
}
