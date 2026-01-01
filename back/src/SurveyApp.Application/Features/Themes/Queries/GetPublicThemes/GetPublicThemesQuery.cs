using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Application.DTOs.Common;

namespace SurveyApp.Application.Features.Themes.Queries.GetPublicThemes;

/// <summary>
/// Query to get all public themes (templates available to all namespaces) with pagination.
/// </summary>
public record GetPublicThemesQuery
    : PagedQuery,
        IRequest<Result<PagedResponse<SurveyThemeSummaryDto>>>
{
    public string? SearchTerm { get; init; }
}
