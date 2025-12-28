using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.DTOs;

namespace SurveyApp.Application.Features.EmailDistributions.Commands.ScheduleDistribution;

/// <summary>
/// Command to schedule an email distribution.
/// </summary>
public record ScheduleDistributionCommand : IRequest<Result<EmailDistributionDto>>
{
    public Guid DistributionId { get; init; }
    public DateTime ScheduledAt { get; init; }
}
