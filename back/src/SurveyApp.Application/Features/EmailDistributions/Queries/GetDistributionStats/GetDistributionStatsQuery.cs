using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.DTOs;

namespace SurveyApp.Application.Features.EmailDistributions.Queries.GetDistributionStats;

/// <summary>
/// Query to get distribution statistics.
/// </summary>
public record GetDistributionStatsQuery(Guid SurveyId, Guid DistributionId)
    : IRequest<Result<DistributionStatsDto>>;
