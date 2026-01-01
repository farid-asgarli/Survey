using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Application.DTOs.Common;

namespace SurveyApp.Application.Features.Themes.Queries.GetThemes;

/// <summary>
/// Query to get all themes in a namespace with pagination.
/// </summary>
public record GetThemesQuery : PagedQuery, IRequest<Result<PagedResponse<SurveyThemeSummaryDto>>>
{
    public string? SearchTerm { get; init; }
}
