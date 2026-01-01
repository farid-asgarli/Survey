using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Features.Translations.Commands.BulkUpdateSurveyTranslations;

namespace SurveyApp.Application.Features.Translations.Commands.UpdateSurveyTranslation;

/// <summary>
/// Command to add or update a single translation for a survey.
/// </summary>
public record UpdateSurveyTranslationCommand : IRequest<Result<SurveyTranslationDto>>
{
    public Guid SurveyId { get; init; }
    public string LanguageCode { get; init; } = null!;
    public string Title { get; init; } = null!;
    public string? Description { get; init; }
    public string? WelcomeMessage { get; init; }
    public string? ThankYouMessage { get; init; }
}
