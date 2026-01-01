using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Application.DTOs.Common;

namespace SurveyApp.Application.Features.RecurringSurveys.Queries.GetRecurringSurveyRuns;

/// <summary>
/// Query to get paginated runs for a recurring survey.
/// </summary>
public record GetRecurringSurveyRunsQuery
    : PagedQuery,
        IRequest<Result<PagedResponse<RecurringSurveyRunDto>>>
{
    public Guid RecurringSurveyId { get; init; }
}
