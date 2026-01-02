using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.DTOs;

namespace SurveyApp.Application.Features.Translations.Commands.BulkUpdateSurveyTranslations;

/// <summary>
/// Command to bulk update all translations for a survey.
/// </summary>
public record BulkUpdateSurveyTranslationsCommand : IRequest<Result<BulkTranslationResultDto>>
{
    public Guid SurveyId { get; init; }
    public IReadOnlyList<SurveyTranslationDto> Translations { get; init; } = [];
    public IReadOnlyList<QuestionTranslationUpdateDto>? QuestionTranslations { get; init; }
}
