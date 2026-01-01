using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.DTOs;
using SurveyApp.Application.DTOs.Common;

namespace SurveyApp.Application.Features.Themes.Queries.GetThemes;

/// <summary>
/// Query to get all themes in a namespace with pagination.
/// </summary>
public record GetThemesQuery : IRequest<Result<PagedResponse<SurveyThemeSummaryDto>>>
{
    public int PageNumber { get; init; } = PaginationDefaults.DefaultPageNumber;
    public int PageSize { get; init; } = PaginationDefaults.DefaultPageSize;
    public string? SearchTerm { get; init; }
}
