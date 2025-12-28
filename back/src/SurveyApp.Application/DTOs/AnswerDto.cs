namespace SurveyApp.Application.DTOs;

/// <summary>
/// DTO for answer data.
/// </summary>
public class AnswerDto
{
    public Guid Id { get; set; }
    public Guid QuestionId { get; set; }
    public string AnswerValue { get; set; } = null!;
    public DateTime AnsweredAt { get; set; }
}

/// <summary>
/// DTO for submitting an answer.
/// </summary>
public class SubmitAnswerDto
{
    public Guid QuestionId { get; set; }
    public string AnswerValue { get; set; } = null!;
}
