using SurveyApp.Domain.Common;
using SurveyApp.Domain.Enums;
using SurveyApp.Domain.ValueObjects;

namespace SurveyApp.Domain.Entities;

/// <summary>
/// Represents a question in a survey.
/// </summary>
public class Question : Entity<Guid>
{
    /// <summary>
    /// Gets the survey ID this question belongs to.
    /// </summary>
    public Guid SurveyId { get; private set; }

    /// <summary>
    /// Gets the text of the question.
    /// </summary>
    public string Text { get; private set; } = null!;

    /// <summary>
    /// Gets the type of the question.
    /// </summary>
    public QuestionType Type { get; private set; }

    /// <summary>
    /// Gets the order of the question in the survey.
    /// </summary>
    public int Order { get; private set; }

    /// <summary>
    /// Gets whether the question is required.
    /// </summary>
    public bool IsRequired { get; private set; }

    /// <summary>
    /// Gets the description/help text for the question.
    /// </summary>
    public string? Description { get; private set; }

    /// <summary>
    /// Gets the settings for the question as JSON.
    /// </summary>
    public string? SettingsJson { get; private set; }

    /// <summary>
    /// Gets whether this question is an NPS (Net Promoter Score) question.
    /// </summary>
    public bool IsNpsQuestion { get; private set; }

    /// <summary>
    /// Gets the type of NPS question (Standard, CSAT, CES).
    /// Only applicable when IsNpsQuestion is true.
    /// </summary>
    public NpsQuestionType? NpsType { get; private set; }

    /// <summary>
    /// Gets the survey navigation property.
    /// </summary>
    public Survey Survey { get; private set; } = null!;

    private Question() { }

    private Question(
        Guid id,
        Guid surveyId,
        string text,
        QuestionType type,
        int order,
        bool isRequired
    )
        : base(id)
    {
        SurveyId = surveyId;
        Text = text;
        Type = type;
        Order = order;
        IsRequired = isRequired;
        SettingsJson = QuestionSettings.CreateDefault(type).ToJson();
    }

    /// <summary>
    /// Creates a new question.
    /// </summary>
    public static Question Create(
        Guid surveyId,
        string text,
        QuestionType type,
        int order,
        bool isRequired = false
    )
    {
        if (string.IsNullOrWhiteSpace(text))
            throw new ArgumentException("Question text cannot be empty.", nameof(text));

        return new Question(Guid.NewGuid(), surveyId, text, type, order, isRequired);
    }

    /// <summary>
    /// Updates the question text.
    /// </summary>
    public void UpdateText(string text)
    {
        if (string.IsNullOrWhiteSpace(text))
            throw new ArgumentException("Question text cannot be empty.", nameof(text));

        Text = text;
    }

    /// <summary>
    /// Updates the question type.
    /// </summary>
    public void UpdateType(QuestionType type)
    {
        Type = type;
        SettingsJson = QuestionSettings.CreateDefault(type).ToJson();
    }

    /// <summary>
    /// Updates the question order.
    /// </summary>
    public void UpdateOrder(int order)
    {
        if (order < 1)
            throw new ArgumentException("Order must be at least 1.", nameof(order));

        Order = order;
    }

    /// <summary>
    /// Updates whether the question is required.
    /// </summary>
    public void UpdateRequired(bool isRequired)
    {
        IsRequired = isRequired;
    }

    /// <summary>
    /// Updates the question description.
    /// </summary>
    public void UpdateDescription(string? description)
    {
        Description = description;
    }

    /// <summary>
    /// Updates the question settings.
    /// </summary>
    public void UpdateSettings(QuestionSettings settings)
    {
        SettingsJson = settings.ToJson();
    }

    /// <summary>
    /// Gets the question settings.
    /// </summary>
    public QuestionSettings GetSettings()
    {
        return string.IsNullOrWhiteSpace(SettingsJson)
            ? QuestionSettings.CreateDefault(Type)
            : QuestionSettings.FromJson(SettingsJson);
    }

    /// <summary>
    /// Marks this question as an NPS question.
    /// </summary>
    /// <param name="npsType">The type of NPS question.</param>
    public void SetAsNpsQuestion(NpsQuestionType npsType = NpsQuestionType.Standard)
    {
        IsNpsQuestion = true;
        NpsType = npsType;

        // Ensure the question type is compatible with NPS
        if (Type != QuestionType.NPS && Type != QuestionType.Scale && Type != QuestionType.Rating)
        {
            Type = QuestionType.NPS;
            SettingsJson = QuestionSettings.CreateDefault(QuestionType.NPS).ToJson();
        }
    }

    /// <summary>
    /// Removes the NPS designation from this question.
    /// </summary>
    public void RemoveNpsDesignation()
    {
        IsNpsQuestion = false;
        NpsType = null;
    }
}
