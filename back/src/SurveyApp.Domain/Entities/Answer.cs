using SurveyApp.Domain.Common;

namespace SurveyApp.Domain.Entities;

/// <summary>
/// Represents an answer to a survey question.
/// </summary>
public class Answer : Entity<Guid>
{
    /// <summary>
    /// Gets the survey response ID this answer belongs to.
    /// </summary>
    public Guid ResponseId { get; private set; }

    /// <summary>
    /// Gets the question ID this answer is for.
    /// </summary>
    public Guid QuestionId { get; private set; }

    /// <summary>
    /// Gets the answer value as JSON.
    /// </summary>
    public string AnswerValue { get; private set; } = null!;

    /// <summary>
    /// Gets the date and time when the answer was submitted.
    /// </summary>
    public DateTime AnsweredAt { get; private set; }

    /// <summary>
    /// Gets the survey response navigation property.
    /// </summary>
    public SurveyResponse Response { get; private set; } = null!;

    /// <summary>
    /// Gets the question navigation property.
    /// </summary>
    public Question Question { get; private set; } = null!;

    private Answer() { }

    private Answer(Guid id, Guid responseId, Guid questionId, string answerValue)
        : base(id)
    {
        ResponseId = responseId;
        QuestionId = questionId;
        AnswerValue = answerValue;
        AnsweredAt = DateTime.UtcNow;
    }

    /// <summary>
    /// Creates a new answer.
    /// </summary>
    public static Answer Create(Guid responseId, Guid questionId, string answerValue)
    {
        return new Answer(Guid.NewGuid(), responseId, questionId, answerValue);
    }

    /// <summary>
    /// Updates the answer value.
    /// </summary>
    public void UpdateValue(string answerValue)
    {
        AnswerValue = answerValue;
        AnsweredAt = DateTime.UtcNow;
    }
}
