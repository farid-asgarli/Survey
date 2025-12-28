using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.DTOs;

namespace SurveyApp.Application.Features.Themes.Queries.GetThemeById;

/// <summary>
/// Query to get a theme by its ID.
/// </summary>
public record GetThemeByIdQuery(Guid ThemeId) : IRequest<Result<SurveyThemeDto>>;
