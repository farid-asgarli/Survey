using SurveyApp.Domain.Common;
using SurveyApp.Domain.Events;

namespace SurveyApp.Domain.Entities;

/// <summary>
/// Represents a response to a survey.
/// </summary>
public class SurveyResponse : AggregateRoot<Guid>
{
    private readonly List<Answer> _answers = [];

    /// <summary>
    /// Gets the survey ID this response belongs to.
    /// </summary>
    public Guid SurveyId { get; private set; }

    /// <summary>
    /// Gets the email of the respondent (if provided).
    /// </summary>
    public string? RespondentEmail { get; private set; }

    /// <summary>
    /// Gets the name of the respondent (if provided).
    /// </summary>
    public string? RespondentName { get; private set; }

    /// <summary>
    /// Gets whether the response is complete.
    /// </summary>
    public bool IsComplete { get; private set; }

    /// <summary>
    /// Gets the date and time when the response was started.
    /// </summary>
    public DateTime StartedAt { get; private set; }

    /// <summary>
    /// Gets the date and time when the response was submitted.
    /// </summary>
    public DateTime? SubmittedAt { get; private set; }

    /// <summary>
    /// Gets the time spent on the survey in seconds.
    /// </summary>
    public int? TimeSpentSeconds { get; private set; }

    /// <summary>
    /// Gets the IP address of the respondent.
    /// </summary>
    public string? IpAddress { get; private set; }

    /// <summary>
    /// Gets the user agent of the respondent.
    /// </summary>
    public string? UserAgent { get; private set; }

    /// <summary>
    /// Gets the access token used to submit this response.
    /// </summary>
    public string AccessToken { get; private set; } = null!;

    /// <summary>
    /// Gets the answers in this response.
    /// </summary>
    public IReadOnlyCollection<Answer> Answers => _answers.AsReadOnly();

    /// <summary>
    /// Gets the survey navigation property.
    /// </summary>
    public Survey Survey { get; private set; } = null!;

    /// <summary>
    /// Gets whether the response is completed.
    /// </summary>
    public bool IsCompleted => IsComplete;

    /// <summary>
    /// Gets the completion date (alias for SubmittedAt).
    /// </summary>
    public DateTime? CompletedAt => SubmittedAt;

    /// <summary>
    /// Gets the respondent user navigation property (if authenticated).
    /// </summary>
    public User? Respondent { get; private set; }

    private SurveyResponse() { }

    private SurveyResponse(
        Guid id,
        Guid surveyId,
        string accessToken,
        string? respondentEmail = null,
        string? ipAddress = null,
        string? userAgent = null
    )
        : base(id)
    {
        SurveyId = surveyId;
        AccessToken = accessToken;
        RespondentEmail = respondentEmail;
        IpAddress = ipAddress;
        UserAgent = userAgent;
        StartedAt = DateTime.UtcNow;
        IsComplete = false;
    }

    /// <summary>
    /// Creates a new survey response.
    /// </summary>
    public static SurveyResponse Create(
        Guid surveyId,
        string accessToken,
        string? respondentEmail = null,
        string? ipAddress = null,
        string? userAgent = null
    )
    {
        if (string.IsNullOrWhiteSpace(accessToken))
            throw new ArgumentException("Access token cannot be empty.", nameof(accessToken));

        return new SurveyResponse(
            Guid.NewGuid(),
            surveyId,
            accessToken,
            respondentEmail,
            ipAddress,
            userAgent
        );
    }

    /// <summary>
    /// Sets the respondent information.
    /// </summary>
    public void SetRespondentInfo(string? email, string? name)
    {
        RespondentEmail = email;
        RespondentName = name;
    }

    /// <summary>
    /// Submits an answer to a question.
    /// </summary>
    public Answer SubmitAnswer(Guid questionId, string answerValue)
    {
        if (IsComplete)
            throw new InvalidOperationException("Cannot submit answers to a completed response.");

        var existingAnswer = _answers.FirstOrDefault(a => a.QuestionId == questionId);
        if (existingAnswer != null)
        {
            existingAnswer.UpdateValue(answerValue);
            return existingAnswer;
        }

        var answer = Answer.Create(Id, questionId, answerValue);
        _answers.Add(answer);
        return answer;
    }

    /// <summary>
    /// Adds an answer to the response.
    /// </summary>
    public void AddAnswer(Guid questionId, string answerValue)
    {
        SubmitAnswer(questionId, answerValue);
    }

    /// <summary>
    /// Adds metadata to the response.
    /// </summary>
    public void AddMetadata(string key, string value)
    {
        // Metadata is stored as IP address and user agent for now
        if (key == "IpAddress")
            IpAddress = value;
        else if (key == "UserAgent")
            UserAgent = value;
    }

    /// <summary>
    /// Completes the survey response.
    /// </summary>
    public void Complete()
    {
        if (IsComplete)
            throw new InvalidOperationException("Response is already complete.");

        IsComplete = true;
        SubmittedAt = DateTime.UtcNow;
        TimeSpentSeconds = (int)(SubmittedAt.Value - StartedAt).TotalSeconds;

        AddDomainEvent(new ResponseSubmittedEvent(Id, SurveyId, RespondentEmail));
    }

    /// <summary>
    /// Validates that all required questions have been answered.
    /// </summary>
    public bool ValidateCompleteness(IEnumerable<Question> requiredQuestions)
    {
        var answeredQuestionIds = _answers.Select(a => a.QuestionId).ToHashSet();
        return requiredQuestions.All(q => answeredQuestionIds.Contains(q.Id));
    }
}
