using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Features.Translations.Commands.BulkUpdateSurveyTranslations;

namespace SurveyApp.Application.Features.Translations.Queries.GetSurveyTranslations;

/// <summary>
/// Query to get all translations for a survey.
/// </summary>
public record GetSurveyTranslationsQuery : IRequest<Result<SurveyTranslationsDto>>
{
    public Guid SurveyId { get; init; }
}

/// <summary>
/// DTO containing all translations for a survey.
/// </summary>
public class SurveyTranslationsDto
{
    public Guid SurveyId { get; set; }
    public string DefaultLanguage { get; set; } = "en";
    public IReadOnlyList<SurveyTranslationDto> Translations { get; set; } = [];
    public IReadOnlyList<QuestionTranslationsDto> Questions { get; set; } = [];
}

/// <summary>
/// DTO containing all translations for a question.
/// </summary>
public class QuestionTranslationsDto
{
    public Guid QuestionId { get; set; }
    public int Order { get; set; }
    public string DefaultLanguage { get; set; } = "en";
    public IReadOnlyList<QuestionTranslationItemDto> Translations { get; set; } = [];
}

/// <summary>
/// DTO for a single question translation.
/// </summary>
public class QuestionTranslationItemDto
{
    public string LanguageCode { get; set; } = null!;
    public string Text { get; set; } = null!;
    public string? Description { get; set; }
    public bool IsDefault { get; set; }
}
