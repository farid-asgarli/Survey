using SurveyApp.Domain.Common;
using SurveyApp.Domain.Enums;
using SurveyApp.Domain.ValueObjects;

namespace SurveyApp.Domain.Entities;

/// <summary>
/// Represents a question in a survey template.
/// </summary>
public class TemplateQuestion : Entity<Guid>
{
    /// <summary>
    /// Gets the template ID this question belongs to.
    /// </summary>
    public Guid TemplateId { get; private set; }

    /// <summary>
    /// Gets the text of the question.
    /// </summary>
    public string Text { get; private set; } = null!;

    /// <summary>
    /// Gets the type of the question.
    /// </summary>
    public QuestionType Type { get; private set; }

    /// <summary>
    /// Gets the order of the question in the template.
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
    /// Gets the template navigation property.
    /// </summary>
    public SurveyTemplate Template { get; private set; } = null!;

    private TemplateQuestion() { }

    private TemplateQuestion(
        Guid id,
        Guid templateId,
        string text,
        QuestionType type,
        int order,
        bool isRequired,
        string? description,
        string? settingsJson
    )
        : base(id)
    {
        TemplateId = templateId;
        Text = text;
        Type = type;
        Order = order;
        IsRequired = isRequired;
        Description = description;
        SettingsJson = settingsJson ?? QuestionSettings.CreateDefault(type).ToJson();
    }

    /// <summary>
    /// Creates a new template question.
    /// </summary>
    public static TemplateQuestion Create(
        Guid templateId,
        string text,
        QuestionType type,
        int order,
        bool isRequired = false,
        string? description = null,
        string? settingsJson = null
    )
    {
        if (string.IsNullOrWhiteSpace(text))
            throw new ArgumentException("Question text cannot be empty.", nameof(text));

        return new TemplateQuestion(
            Guid.NewGuid(),
            templateId,
            text,
            type,
            order,
            isRequired,
            description,
            settingsJson
        );
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
}
