using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.DTOs;

namespace SurveyApp.Application.Features.Themes.Queries.GetThemes;

/// <summary>
/// Query to get all themes in a namespace.
/// </summary>
public record GetThemesQuery : IRequest<Result<IReadOnlyList<SurveyThemeSummaryDto>>>
{
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 20;
    public string? SearchTerm { get; init; }
}
