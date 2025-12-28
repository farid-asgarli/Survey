using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.DTOs;

namespace SurveyApp.Application.Features.EmailDistributions.Queries.GetDistributions;

/// <summary>
/// Query to get email distributions for a survey.
/// </summary>
public record GetDistributionsQuery : IRequest<Result<IReadOnlyList<EmailDistributionSummaryDto>>>
{
    public Guid SurveyId { get; init; }
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 20;
}
