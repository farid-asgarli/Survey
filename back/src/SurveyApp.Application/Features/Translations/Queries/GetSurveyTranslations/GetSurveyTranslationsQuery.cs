using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.DTOs;

namespace SurveyApp.Application.Features.Translations.Queries.GetSurveyTranslations;

/// <summary>
/// Query to get all translations for a survey.
/// </summary>
/// <param name="SurveyId">The survey ID.</param>
public record GetSurveyTranslationsQuery(Guid SurveyId) : IRequest<Result<SurveyTranslationsDto>>;
