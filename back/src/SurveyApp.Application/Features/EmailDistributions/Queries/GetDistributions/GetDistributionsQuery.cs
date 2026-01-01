using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Application.DTOs.Common;

namespace SurveyApp.Application.Features.EmailDistributions.Queries.GetDistributions;

/// <summary>
/// Query to get email distributions for a survey.
/// </summary>
public record GetDistributionsQuery
    : PagedQuery,
        IRequest<Result<PagedResponse<EmailDistributionSummaryDto>>>
{
    public Guid SurveyId { get; init; }
}
