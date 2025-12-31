using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.DTOs;

namespace SurveyApp.Application.Features.EmailDistributions.Queries.GetDistributionById;

/// <summary>
/// Query to get an email distribution by its ID.
/// </summary>
public record GetDistributionByIdQuery(Guid SurveyId, Guid DistributionId)
    : IRequest<Result<EmailDistributionDto>>;
