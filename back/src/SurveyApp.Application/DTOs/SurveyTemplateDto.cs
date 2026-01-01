using SurveyApp.Domain.Enums;

namespace SurveyApp.Application.DTOs;

/// <summary>
/// DTO for survey template data.
/// </summary>
public class SurveyTemplateDto
{
    public Guid Id { get; set; }
    public Guid NamespaceId { get; set; }
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public string? Category { get; set; }
    public bool IsPublic { get; set; }
    public string? WelcomeMessage { get; set; }
    public string? ThankYouMessage { get; set; }
    public bool DefaultAllowAnonymous { get; set; }
    public bool DefaultAllowMultipleResponses { get; set; }
    public int UsageCount { get; set; }
    public int QuestionCount { get; set; }
    public DateTime CreatedAt { get; set; }
    public Guid? CreatedBy { get; set; }
    public IReadOnlyList<TemplateQuestionDto> Questions { get; set; } = [];

    // Localization metadata
    public string DefaultLanguage { get; set; } = "en";
    public string Language { get; set; } = "en";
    public IReadOnlyList<string> AvailableLanguages { get; set; } = [];
}

/// <summary>
/// DTO for template question data.
/// </summary>
public class TemplateQuestionDto
{
    public Guid Id { get; set; }
    public string Text { get; set; } = null!;
    public QuestionType Type { get; set; }
    public int Order { get; set; }
    public bool IsRequired { get; set; }
    public string? Description { get; set; }
    public QuestionSettingsResponseDto? Settings { get; set; }

    // Localization metadata
    public string DefaultLanguage { get; set; } = "en";
}

/// <summary>
/// DTO for question settings response.
/// </summary>
public class QuestionSettingsResponseDto
{
    public IReadOnlyList<QuestionOptionDto>? Options { get; set; }
    public int? MinValue { get; set; }
    public int? MaxValue { get; set; }
    public string? MinLabel { get; set; }
    public string? MaxLabel { get; set; }
    public IReadOnlyList<string>? AllowedFileTypes { get; set; }
    public long? MaxFileSize { get; set; }
    public IReadOnlyList<string>? MatrixRows { get; set; }
    public IReadOnlyList<string>? MatrixColumns { get; set; }
    public string? Placeholder { get; set; }
    public bool AllowOther { get; set; }
    public int? MaxLength { get; set; }
    public int? MinLength { get; set; }
    public int? MaxSelections { get; set; }
    public string? ValidationPattern { get; set; }
    public string? ValidationMessage { get; set; }
    public string? ValidationPreset { get; set; }
    public RatingStyle? RatingStyle { get; set; }
    public YesNoStyle? YesNoStyle { get; set; }
}

/// <summary>
/// Summary DTO for template listings.
/// </summary>
public class SurveyTemplateSummaryDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public string? Category { get; set; }
    public bool IsPublic { get; set; }
    public int UsageCount { get; set; }
    public int QuestionCount { get; set; }
    public DateTime CreatedAt { get; set; }

    // Localization metadata
    public string DefaultLanguage { get; set; } = "en";
}
