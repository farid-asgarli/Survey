using MediatR;
using SurveyApp.Application.Common;

namespace SurveyApp.Application.Features.EmailDistributions.Commands.DeleteDistribution;

/// <summary>
/// Command to delete an email distribution.
/// </summary>
public record DeleteDistributionCommand(Guid DistributionId) : IRequest<Result<bool>>;
