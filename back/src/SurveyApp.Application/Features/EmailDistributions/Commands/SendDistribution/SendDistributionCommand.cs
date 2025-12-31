using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.DTOs;

namespace SurveyApp.Application.Features.EmailDistributions.Commands.SendDistribution;

/// <summary>
/// Command to send an email distribution immediately.
/// </summary>
public record SendDistributionCommand(Guid SurveyId, Guid DistributionId)
    : IRequest<Result<EmailDistributionDto>>;
