using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.DTOs;
using SurveyApp.Application.DTOs.Common;

namespace SurveyApp.Application.Features.RecurringSurveys.Queries.GetRecurringSurveys;

/// <summary>
/// Query to get paginated list of recurring surveys.
/// </summary>
public record GetRecurringSurveysQuery : IRequest<Result<PagedResponse<RecurringSurveyListItemDto>>>
{
    public int PageNumber { get; init; } = PaginationDefaults.DefaultPageNumber;
    public int PageSize { get; init; } = PaginationDefaults.DefaultPageSize;
    public string? SearchTerm { get; init; }
    public bool? IsActive { get; init; }
}
