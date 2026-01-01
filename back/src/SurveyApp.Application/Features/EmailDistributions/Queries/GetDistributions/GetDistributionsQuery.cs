using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.DTOs;
using SurveyApp.Application.DTOs.Common;

namespace SurveyApp.Application.Features.EmailDistributions.Queries.GetDistributions;

/// <summary>
/// Query to get email distributions for a survey.
/// </summary>
public record GetDistributionsQuery : IRequest<Result<PagedResponse<EmailDistributionSummaryDto>>>
{
    public Guid SurveyId { get; init; }
    public int PageNumber { get; init; } = PaginationDefaults.DefaultPageNumber;
    public int PageSize { get; init; } = PaginationDefaults.DefaultPageSize;
}
