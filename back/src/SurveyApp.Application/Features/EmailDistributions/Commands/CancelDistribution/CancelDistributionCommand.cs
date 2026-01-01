using MediatR;
using SurveyApp.Application.Common;

namespace SurveyApp.Application.Features.EmailDistributions.Commands.CancelDistribution;

/// <summary>
/// Command to cancel a scheduled email distribution.
/// </summary>
public record CancelDistributionCommand(Guid SurveyId, Guid DistributionId)
    : IRequest<Result<Unit>>;
