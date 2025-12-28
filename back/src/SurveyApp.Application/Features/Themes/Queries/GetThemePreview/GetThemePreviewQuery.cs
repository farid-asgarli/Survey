using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.DTOs;

namespace SurveyApp.Application.Features.Themes.Queries.GetThemePreview;

/// <summary>
/// Query to get a theme preview with generated CSS.
/// </summary>
public record GetThemePreviewQuery(Guid ThemeId) : IRequest<Result<ThemePreviewDto>>;
