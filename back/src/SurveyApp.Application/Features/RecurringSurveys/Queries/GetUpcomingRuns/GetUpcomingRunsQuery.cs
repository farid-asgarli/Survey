using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.DTOs;

namespace SurveyApp.Application.Features.RecurringSurveys.Queries.GetUpcomingRuns;

/// <summary>
/// Query to get upcoming runs for all active recurring surveys.
/// </summary>
/// <param name="Count">Number of upcoming runs to retrieve. Defaults to 10.</param>
public record GetUpcomingRunsQuery(int Count = 10)
    : IRequest<Result<IReadOnlyList<UpcomingRunDto>>>;
