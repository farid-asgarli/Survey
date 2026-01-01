using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.DTOs;

namespace SurveyApp.Application.Features.Surveys.Queries.GetPublicSurvey;

/// <summary>
/// Query to get a public survey by its share token.
/// </summary>
/// <param name="ShareToken">The unique share token for the survey.</param>
/// <param name="LanguageCode">Optional language code for localized content. Falls back to survey's default language if not provided.</param>
public record GetPublicSurveyQuery(string ShareToken, string? LanguageCode = null)
    : IRequest<Result<PublicSurveyDto>>;
