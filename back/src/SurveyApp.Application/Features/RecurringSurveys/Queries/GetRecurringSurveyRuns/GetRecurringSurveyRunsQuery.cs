using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.DTOs;

namespace SurveyApp.Application.Features.RecurringSurveys.Queries.GetRecurringSurveyRuns;

/// <summary>
/// Query to get paginated runs for a recurring survey.
/// </summary>
public record GetRecurringSurveyRunsQuery : IRequest<Result<PagedList<RecurringSurveyRunDto>>>
{
    public Guid RecurringSurveyId { get; init; }
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 10;
}
