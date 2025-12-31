using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Features.Translations.Commands.BulkUpdateSurveyTranslations;
using SurveyApp.Domain.ValueObjects;

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
    /// <summary>
    /// Translated options for choice-based questions.
    /// </summary>
    public IReadOnlyList<string>? Options { get; set; }

    /// <summary>
    /// Translated minimum label for scale/rating questions.
    /// </summary>
    public string? MinLabel { get; set; }

    /// <summary>
    /// Translated maximum label for scale/rating questions.
    /// </summary>
    public string? MaxLabel { get; set; }

    /// <summary>
    /// Translated rows for matrix questions.
    /// </summary>
    public IReadOnlyList<string>? MatrixRows { get; set; }

    /// <summary>
    /// Translated columns for matrix questions.
    /// </summary>
    public IReadOnlyList<string>? MatrixColumns { get; set; }

    /// <summary>
    /// Translated placeholder text for text questions.
    /// </summary>
    public string? Placeholder { get; set; }

    /// <summary>
    /// Translated validation error message.
    /// </summary>
    public string? ValidationMessage { get; set; }

    /// <summary>
    /// Translated "Other" option label.
    /// </summary>
    public string? OtherLabel { get; set; }

    /// <summary>
    /// Creates a DTO from a domain value object.
    /// </summary>
    public static TranslatedQuestionSettingsDto? FromDomain(TranslatedQuestionSettings? settings)
    {
        if (settings == null)
            return null;

        return new TranslatedQuestionSettingsDto
        {
            Options = settings.Options,
            MinLabel = settings.MinLabel,
            MaxLabel = settings.MaxLabel,
            MatrixRows = settings.MatrixRows,
            MatrixColumns = settings.MatrixColumns,
            Placeholder = settings.Placeholder,
            ValidationMessage = settings.ValidationMessage,
            OtherLabel = settings.OtherLabel,
        };
    }

    /// <summary>
    /// Converts to domain value object.
    /// </summary>
    public TranslatedQuestionSettings? ToDomain()
    {
        // Return null if all properties are null/empty
        if (
            Options == null
            && MinLabel == null
            && MaxLabel == null
            && MatrixRows == null
            && MatrixColumns == null
            && Placeholder == null
            && ValidationMessage == null
            && OtherLabel == null
        )
        {
            return null;
        }

        return new TranslatedQuestionSettings
        {
            Options = Options,
            MinLabel = MinLabel,
            MaxLabel = MaxLabel,
            MatrixRows = MatrixRows,
            MatrixColumns = MatrixColumns,
            Placeholder = Placeholder,
            ValidationMessage = ValidationMessage,
            OtherLabel = OtherLabel,
        };
    }
}
