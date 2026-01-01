using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.DTOs;
using SurveyApp.Application.DTOs.Common;

namespace SurveyApp.Application.Features.SurveyLinks.Queries.GetSurveyLinks;

/// <summary>
/// Query to get all links for a survey with pagination.
/// </summary>
public record GetSurveyLinksQuery : IRequest<Result<PagedResponse<SurveyLinkDto>>>
{
    public Guid SurveyId { get; init; }
    public int PageNumber { get; init; } = PaginationDefaults.DefaultPageNumber;
    public int PageSize { get; init; } = PaginationDefaults.DefaultPageSize;
    public bool? IsActive { get; init; }
}
