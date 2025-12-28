using MediatR;
using SurveyApp.Application.Common;

namespace SurveyApp.Application.Features.Translations.Commands.BulkUpdateSurveyTranslations;

/// <summary>
/// Command to bulk update all translations for a survey.
/// </summary>
public record BulkUpdateSurveyTranslationsCommand : IRequest<Result<BulkTranslationResultDto>>
{
    public Guid SurveyId { get; init; }
    public IReadOnlyList<SurveyTranslationDto> Translations { get; init; } = [];
}

/// <summary>
/// DTO for a single survey translation.
/// </summary>
public class SurveyTranslationDto
{
    public string LanguageCode { get; set; } = null!;
    public string Title { get; set; } = null!;
    public string? Description { get; set; }
    public string? WelcomeMessage { get; set; }
    public string? ThankYouMessage { get; set; }
    public bool IsDefault { get; set; }
}

/// <summary>
/// Result DTO for bulk translation operations.
/// </summary>
public class BulkTranslationResultDto
{
    public int TotalProcessed { get; set; }
    public int SuccessCount { get; set; }
    public int FailureCount { get; set; }
    public IReadOnlyList<string> Errors { get; set; } = [];
    public IReadOnlyList<string> Languages { get; set; } = [];
}
