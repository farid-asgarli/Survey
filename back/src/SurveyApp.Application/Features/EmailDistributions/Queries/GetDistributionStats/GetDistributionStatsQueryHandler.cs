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

        if (
            distribution == null
            || distribution.NamespaceId != namespaceId.Value
            || distribution.SurveyId != request.SurveyId
        )
        {
            return Result<DistributionStatsDto>.NotFound("Errors.DistributionNotFound");
        }

        var stats = new DistributionStatsDto
        {
            DistributionId = distribution.Id,
            TotalRecipients = distribution.TotalRecipients,
            Sent = distribution.SentCount,
            Delivered = distribution.DeliveredCount,
            Opened = distribution.OpenedCount,
            Clicked = distribution.ClickedCount,
            Bounced = distribution.BouncedCount,
            Failed =
                distribution.Recipients?.Count(r => r.Status == Domain.Enums.RecipientStatus.Failed)
                ?? 0,
        };

        return Result<DistributionStatsDto>.Success(stats);
    }
}
