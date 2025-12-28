using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.DTOs;

namespace SurveyApp.Application.Features.Surveys.Queries.GetPublicSurvey;

public record GetPublicSurveyQuery : IRequest<Result<PublicSurveyDto>>
{
    public string ShareToken { get; init; } = string.Empty;

    /// <summary>
    /// Optional language code for localized content. Falls back to survey's default language if not provided.
    /// </summary>
    public string? LanguageCode { get; init; }
}
