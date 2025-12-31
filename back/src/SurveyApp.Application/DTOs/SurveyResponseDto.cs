namespace SurveyApp.Application.DTOs;

/// <summary>
/// DTO for survey response data.
/// Note: IP addresses are not exposed in DTOs for GDPR compliance.
/// For analytics use cases that require IP data, use dedicated analytics DTOs with explicit consent.
/// </summary>
public class SurveyResponseDto
{
    public Guid Id { get; set; }
    public Guid SurveyId { get; set; }
    public string? RespondentEmail { get; set; }
    public string? RespondentName { get; set; }
    public bool IsComplete { get; set; }
    public DateTime StartedAt { get; set; }
    public DateTime? SubmittedAt { get; set; }
    public int? TimeSpentSeconds { get; set; }
    public IReadOnlyList<AnswerDto> Answers { get; set; } = Array.Empty<AnswerDto>();
}

/// <summary>
/// DTO for response list item (summary).
/// </summary>
public class ResponseListItemDto
{
    public Guid Id { get; set; }
    public Guid? RespondentId { get; set; }
    public string? RespondentEmail { get; set; }
    public string? RespondentName { get; set; }
    public bool IsComplete { get; set; }
    public bool IsCompleted { get; set; }
    public DateTime StartedAt { get; set; }
    public DateTime? SubmittedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public int? TimeSpentSeconds { get; set; }
    public int AnswerCount { get; set; }
}
