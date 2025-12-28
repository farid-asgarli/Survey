using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.DTOs;

namespace SurveyApp.Application.Features.RecurringSurveys.Queries.GetUpcomingRuns;

/// <summary>
/// Query to get upcoming runs for all active recurring surveys.
/// </summary>
public record GetUpcomingRunsQuery : IRequest<Result<IReadOnlyList<UpcomingRunDto>>>
{
    public int Count { get; init; } = 10;
}
