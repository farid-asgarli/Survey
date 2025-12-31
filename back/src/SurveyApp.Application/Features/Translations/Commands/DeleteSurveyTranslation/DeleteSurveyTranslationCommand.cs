using MediatR;
using SurveyApp.Application.Common;

namespace SurveyApp.Application.Features.Translations.Commands.DeleteSurveyTranslation;

/// <summary>
/// Command to delete a translation for a survey.
/// </summary>
public record DeleteSurveyTranslationCommand : IRequest<Result>
{
    public Guid SurveyId { get; init; }
    public string LanguageCode { get; init; } = null!;
}
