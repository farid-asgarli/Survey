using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.DTOs;

namespace SurveyApp.Application.Features.RecurringSurveys.Queries.GetRecurringSurveys;

/// <summary>
/// Query to get paginated list of recurring surveys.
/// </summary>
public record GetRecurringSurveysQuery : IRequest<Result<PagedList<RecurringSurveyListItemDto>>>
{
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 10;
    public string? SearchTerm { get; init; }
    public bool? IsActive { get; init; }
}
