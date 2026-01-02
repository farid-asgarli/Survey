using SurveyApp.Domain.ValueObjects;

namespace SurveyApp.Application.DTOs;

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
/// Response DTO containing all translations for a survey.
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
