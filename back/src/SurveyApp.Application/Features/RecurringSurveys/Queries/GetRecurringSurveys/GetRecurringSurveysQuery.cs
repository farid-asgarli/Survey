using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Application.DTOs.Common;

namespace SurveyApp.Application.Features.RecurringSurveys.Queries.GetRecurringSurveys;

/// <summary>
/// Query to get paginated list of recurring surveys.
/// </summary>
public record GetRecurringSurveysQuery
    : PagedQuery,
        IRequest<Result<PagedResponse<RecurringSurveyListItemDto>>>
{
    public string? SearchTerm { get; init; }
    public bool? IsActive { get; init; }
}
