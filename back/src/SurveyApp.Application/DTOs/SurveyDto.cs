using SurveyApp.Domain.Enums;

namespace SurveyApp.Application.DTOs;

/// <summary>
/// DTO for survey data.
/// </summary>
public class SurveyDto
{
    public Guid Id { get; set; }
    public Guid NamespaceId { get; set; }
    public string Title { get; set; } = null!;
    public string? Description { get; set; }
    public SurveyStatus Status { get; set; }
    public string? WelcomeMessage { get; set; }
    public string? ThankYouMessage { get; set; }
    public string AccessToken { get; set; } = null!;
    public DateTime? PublishedAt { get; set; }
    public DateTime? ClosedAt { get; set; }
    public DateTime? StartsAt { get; set; }
    public DateTime? EndsAt { get; set; }
    public bool AllowAnonymousResponses { get; set; }
    public bool AllowMultipleResponses { get; set; }
    public int? MaxResponses { get; set; }
    public Guid? ThemeId { get; set; }
    public string? PresetThemeId { get; set; }
    public string? ThemeCustomizations { get; set; }
    public int QuestionCount { get; set; }
    public int ResponseCount { get; set; }
    public DateTime CreatedAt { get; set; }
    public Guid? CreatedBy { get; set; }
}

/// <summary>
/// DTO for survey details with questions.
/// </summary>
public class SurveyDetailsDto : SurveyDto
{
    public IReadOnlyList<QuestionDto> Questions { get; set; } = Array.Empty<QuestionDto>();
}

/// <summary>
/// DTO for survey list item (summary).
/// </summary>
public class SurveyListItemDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = null!;
    public string? Description { get; set; }
    public SurveyStatus Status { get; set; }
    public int QuestionCount { get; set; }
    public int ResponseCount { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? PublishedAt { get; set; }
    public DateTime? ClosedAt { get; set; }
}

/// <summary>
/// DTO for public survey (for respondents).
/// </summary>
public class PublicSurveyDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = null!;
    public string? Description { get; set; }
    public string? WelcomeMessage { get; set; }
    public string? ThankYouMessage { get; set; }
    public bool AllowAnonymousResponses { get; set; }
    public bool IsAnonymous { get; set; }
    public IReadOnlyList<PublicQuestionDto> Questions { get; set; } =
        Array.Empty<PublicQuestionDto>();
}
