using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.DTOs;

namespace SurveyApp.Application.Features.Themes.Queries.GetPublicThemes;

/// <summary>
/// Query to get all public themes (templates available to all namespaces).
/// </summary>
public record GetPublicThemesQuery : IRequest<Result<IReadOnlyList<SurveyThemeSummaryDto>>>;
