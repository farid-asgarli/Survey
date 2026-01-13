using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Application.DTOs.Common;

namespace SurveyApp.Application.Features.Categories.Queries.GetCategories;

/// <summary>
/// Query to get all categories in a namespace with pagination.
/// </summary>
public record GetCategoriesQuery
    : PagedQuery,
        IRequest<Result<PagedResponse<SurveyCategorySummaryDto>>>
{
    public string? SearchTerm { get; init; }
}
