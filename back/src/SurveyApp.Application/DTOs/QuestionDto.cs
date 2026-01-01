using SurveyApp.Domain.Enums;

namespace SurveyApp.Application.DTOs;

/// <summary>
/// DTO for question data.
/// </summary>
public class QuestionDto
{
    public Guid Id { get; set; }
    public Guid SurveyId { get; set; }
    public string Text { get; set; } = null!;
    public QuestionType Type { get; set; }
    public int Order { get; set; }
    public bool IsRequired { get; set; }
    public string? Description { get; set; }
    public QuestionSettingsDto? Settings { get; set; }
    public bool IsNpsQuestion { get; set; }
    public NpsQuestionType? NpsType { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

/// <summary>
/// DTO for public question (for respondents).
/// </summary>
public class PublicQuestionDto
{
    public Guid Id { get; set; }
    public string Text { get; set; } = null!;
    public QuestionType Type { get; set; }
    public int Order { get; set; }
    public bool IsRequired { get; set; }
    public string? Description { get; set; }
    public QuestionSettingsDto? Settings { get; set; }
    public bool IsNpsQuestion { get; set; }
    public NpsQuestionType? NpsType { get; set; }
}

/// <summary>
/// Option with stable ID for aggregation.
/// </summary>
public record QuestionOptionDto
{
    public Guid Id { get; init; }
    public string Text { get; init; } = null!;
    public int Order { get; init; }
}

/// <summary>
/// Question settings DTO.
/// </summary>
public record QuestionSettingsDto
{
    /// <summary>
    /// Options with IDs for choice-based questions.
    /// </summary>
    public IReadOnlyList<QuestionOptionDto>? Options { get; init; }

    public int? MinValue { get; init; }
    public int? MaxValue { get; init; }
    public string? MinLabel { get; init; }
    public string? MaxLabel { get; init; }
    public IReadOnlyList<string>? AllowedFileTypes { get; init; }
    public long? MaxFileSize { get; init; }
    public IReadOnlyList<string>? MatrixRows { get; init; }
    public IReadOnlyList<string>? MatrixColumns { get; init; }
    public string? Placeholder { get; init; }
    public bool AllowOther { get; init; }
    public int? MaxLength { get; init; }
    public int? MinLength { get; init; }
    public int? MaxSelections { get; init; }
    public string? ValidationPattern { get; init; }
    public string? ValidationMessage { get; init; }
    public string? ValidationPreset { get; init; }
    public RatingStyle? RatingStyle { get; init; }
    public YesNoStyle? YesNoStyle { get; init; }
}
