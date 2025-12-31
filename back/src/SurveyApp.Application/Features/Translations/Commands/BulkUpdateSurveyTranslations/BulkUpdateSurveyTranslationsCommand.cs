using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Domain.ValueObjects;

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
/// DTO for updating a single question's translation.
/// </summary>
public class QuestionTranslationUpdateDto
{
    public Guid QuestionId { get; set; }
    public string LanguageCode { get; set; } = null!;
    public string Text { get; set; } = null!;
    public string? Description { get; set; }

    /// <summary>
    /// Translated question settings (options, labels, matrix rows/columns, etc.)
    /// </summary>
    public TranslatedQuestionSettingsDto? TranslatedSettings { get; set; }
}

/// <summary>
/// DTO for translated question settings.
/// </summary>
public class TranslatedQuestionSettingsDto
{
    /// <summary>Translated options for choice-based questions.</summary>
    public IReadOnlyList<string>? Options { get; set; }

    /// <summary>Translated minimum label for scale/rating questions.</summary>
    public string? MinLabel { get; set; }

    /// <summary>Translated maximum label for scale/rating questions.</summary>
    public string? MaxLabel { get; set; }

    /// <summary>Translated rows for matrix questions.</summary>
    public IReadOnlyList<string>? MatrixRows { get; set; }

    /// <summary>Translated columns for matrix questions.</summary>
    public IReadOnlyList<string>? MatrixColumns { get; set; }

    /// <summary>Translated placeholder text for text questions.</summary>
    public string? Placeholder { get; set; }

    /// <summary>Translated validation error message.</summary>
    public string? ValidationMessage { get; set; }

    /// <summary>Translated "Other" option label.</summary>
    public string? OtherLabel { get; set; }

    /// <summary>
    /// Converts to domain value object.
    /// </summary>
    public TranslatedQuestionSettings ToDomain()
    {
        return new TranslatedQuestionSettings
        {
            Options = Options?.ToList(),
            MinLabel = MinLabel,
            MaxLabel = MaxLabel,
            MatrixRows = MatrixRows?.ToList(),
            MatrixColumns = MatrixColumns?.ToList(),
            Placeholder = Placeholder,
            ValidationMessage = ValidationMessage,
            OtherLabel = OtherLabel,
        };
    }
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

    /// <summary>
    /// Translation completion status per language (percentage 0-100).
    /// </summary>
    public IDictionary<string, int>? CompletionStatus { get; set; }
}
