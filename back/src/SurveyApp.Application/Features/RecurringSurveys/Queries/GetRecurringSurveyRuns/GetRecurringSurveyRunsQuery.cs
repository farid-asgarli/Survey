using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.DTOs;
using SurveyApp.Application.DTOs.Common;

namespace SurveyApp.Application.Features.RecurringSurveys.Queries.GetRecurringSurveyRuns;

/// <summary>
/// Query to get paginated runs for a recurring survey.
/// </summary>
public record GetRecurringSurveyRunsQuery : IRequest<Result<PagedResponse<RecurringSurveyRunDto>>>
{
    public Guid RecurringSurveyId { get; init; }
    public int PageNumber { get; init; } = PaginationDefaults.DefaultPageNumber;
    public int PageSize { get; init; } = PaginationDefaults.DefaultPageSize;
}
