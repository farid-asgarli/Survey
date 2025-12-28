using SurveyApp.Domain.Common;
using SurveyApp.Domain.Enums;

namespace SurveyApp.Domain.Entities;

/// <summary>
/// Represents a reusable survey template.
/// </summary>
public class SurveyTemplate : AggregateRoot<Guid>
{
    private readonly List<TemplateQuestion> _questions = [];

    /// <summary>
    /// Gets the namespace ID this template belongs to.
    /// </summary>
    public Guid NamespaceId { get; private set; }

    /// <summary>
    /// Gets the name of the template.
    /// </summary>
    public string Name { get; private set; } = null!;

    /// <summary>
    /// Gets the description of the template.
    /// </summary>
    public string? Description { get; private set; }

    /// <summary>
    /// Gets the category of the template.
    /// </summary>
    public string? Category { get; private set; }

    /// <summary>
    /// Gets whether the template is publicly available within the namespace.
    /// </summary>
    public bool IsPublic { get; private set; }

    /// <summary>
    /// Gets the welcome message for surveys created from this template.
    /// </summary>
    public string? WelcomeMessage { get; private set; }

    /// <summary>
    /// Gets the thank you message for surveys created from this template.
    /// </summary>
    public string? ThankYouMessage { get; private set; }

    /// <summary>
    /// Gets the default settings for anonymous responses.
    /// </summary>
    public bool DefaultAllowAnonymous { get; private set; }

    /// <summary>
    /// Gets the default settings for multiple responses.
    /// </summary>
    public bool DefaultAllowMultipleResponses { get; private set; }

    /// <summary>
    /// Gets the number of times this template has been used.
    /// </summary>
    public int UsageCount { get; private set; }

    /// <summary>
    /// Gets the questions in the template.
    /// </summary>
    public IReadOnlyCollection<TemplateQuestion> Questions => _questions.AsReadOnly();

    /// <summary>
    /// Gets the namespace navigation property.
    /// </summary>
    public Namespace Namespace { get; private set; } = null!;

    private SurveyTemplate() { }

    private SurveyTemplate(Guid id, Guid namespaceId, string name, Guid createdBy)
        : base(id)
    {
        NamespaceId = namespaceId;
        Name = name;
        IsPublic = false;
        DefaultAllowAnonymous = true;
        DefaultAllowMultipleResponses = false;
        UsageCount = 0;
        CreatedBy = createdBy;
    }

    /// <summary>
    /// Creates a new survey template.
    /// </summary>
    public static SurveyTemplate Create(Guid namespaceId, string name, Guid createdBy)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Template name cannot be empty.", nameof(name));

        return new SurveyTemplate(Guid.NewGuid(), namespaceId, name, createdBy);
    }

    /// <summary>
    /// Creates a template from an existing survey.
    /// </summary>
    public static SurveyTemplate CreateFromSurvey(
        Survey survey,
        string templateName,
        Guid createdBy
    )
    {
        if (string.IsNullOrWhiteSpace(templateName))
            throw new ArgumentException("Template name cannot be empty.", nameof(templateName));

        var template = new SurveyTemplate(
            Guid.NewGuid(),
            survey.NamespaceId,
            templateName,
            createdBy
        )
        {
            Description = survey.Description,
            WelcomeMessage = survey.WelcomeMessage,
            ThankYouMessage = survey.ThankYouMessage,
            DefaultAllowAnonymous = survey.AllowAnonymousResponses,
            DefaultAllowMultipleResponses = survey.AllowMultipleResponses,
        };

        // Copy questions
        foreach (var question in survey.Questions.OrderBy(q => q.Order))
        {
            template.AddQuestion(
                question.Text,
                question.Type,
                question.IsRequired,
                question.Description,
                question.SettingsJson
            );
        }

        return template;
    }

    /// <summary>
    /// Updates the template name.
    /// </summary>
    public void UpdateName(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Template name cannot be empty.", nameof(name));

        Name = name;
    }

    /// <summary>
    /// Updates the template description.
    /// </summary>
    public void UpdateDescription(string? description)
    {
        Description = description;
    }

    /// <summary>
    /// Updates the template category.
    /// </summary>
    public void UpdateCategory(string? category)
    {
        Category = category;
    }

    /// <summary>
    /// Sets the template visibility.
    /// </summary>
    public void SetPublic(bool isPublic)
    {
        IsPublic = isPublic;
    }

    /// <summary>
    /// Sets the welcome message.
    /// </summary>
    public void SetWelcomeMessage(string? message)
    {
        WelcomeMessage = message;
    }

    /// <summary>
    /// Sets the thank you message.
    /// </summary>
    public void SetThankYouMessage(string? message)
    {
        ThankYouMessage = message;
    }

    /// <summary>
    /// Configures default response settings.
    /// </summary>
    public void ConfigureDefaults(bool allowAnonymous, bool allowMultipleResponses)
    {
        DefaultAllowAnonymous = allowAnonymous;
        DefaultAllowMultipleResponses = allowMultipleResponses;
    }

    /// <summary>
    /// Adds a question to the template.
    /// </summary>
    public TemplateQuestion AddQuestion(
        string text,
        QuestionType type,
        bool isRequired = false,
        string? description = null,
        string? settingsJson = null
    )
    {
        var order = _questions.Count + 1;
        var question = TemplateQuestion.Create(
            Id,
            text,
            type,
            order,
            isRequired,
            description,
            settingsJson
        );
        _questions.Add(question);
        return question;
    }

    /// <summary>
    /// Removes a question from the template.
    /// </summary>
    public void RemoveQuestion(Guid questionId)
    {
        var question = _questions.FirstOrDefault(q => q.Id == questionId);
        if (question == null)
            throw new InvalidOperationException("Question not found in template.");

        _questions.Remove(question);
        ReorderQuestions();
    }

    /// <summary>
    /// Reorders a question in the template.
    /// </summary>
    public void ReorderQuestion(Guid questionId, int newOrder)
    {
        var question = _questions.FirstOrDefault(q => q.Id == questionId);
        if (question == null)
            throw new InvalidOperationException("Question not found in template.");

        if (newOrder < 1 || newOrder > _questions.Count)
            throw new ArgumentOutOfRangeException(
                nameof(newOrder),
                "Order must be between 1 and the number of questions."
            );

        var currentOrder = question.Order;
        if (currentOrder == newOrder)
            return;

        foreach (var q in _questions)
        {
            if (currentOrder < newOrder)
            {
                // Moving down
                if (q.Order > currentOrder && q.Order <= newOrder)
                    q.UpdateOrder(q.Order - 1);
            }
            else
            {
                // Moving up
                if (q.Order >= newOrder && q.Order < currentOrder)
                    q.UpdateOrder(q.Order + 1);
            }
        }

        question.UpdateOrder(newOrder);
    }

    /// <summary>
    /// Increments the usage count when a survey is created from this template.
    /// </summary>
    public void IncrementUsageCount()
    {
        UsageCount++;
    }

    /// <summary>
    /// Creates a survey from this template.
    /// </summary>
    public Survey CreateSurvey(string title, Guid createdBy)
    {
        var survey = Survey.Create(NamespaceId, title, createdBy);

        survey.UpdateDescription(Description);

        if (!string.IsNullOrEmpty(WelcomeMessage))
            survey.SetWelcomeMessage(WelcomeMessage);

        if (!string.IsNullOrEmpty(ThankYouMessage))
            survey.SetThankYouMessage(ThankYouMessage);

        survey.SetAnonymous(DefaultAllowAnonymous);
        survey.ConfigureResponseSettings(
            DefaultAllowAnonymous,
            DefaultAllowMultipleResponses,
            null
        );

        // Add questions from template
        foreach (var templateQuestion in _questions.OrderBy(q => q.Order))
        {
            var question = survey.AddQuestion(
                templateQuestion.Text,
                templateQuestion.Type,
                templateQuestion.IsRequired
            );

            if (!string.IsNullOrEmpty(templateQuestion.Description))
                question.UpdateDescription(templateQuestion.Description);

            if (!string.IsNullOrEmpty(templateQuestion.SettingsJson))
            {
                var settings = Domain.ValueObjects.QuestionSettings.FromJson(
                    templateQuestion.SettingsJson
                );
                question.UpdateSettings(settings);
            }
        }

        IncrementUsageCount();

        return survey;
    }

    private void ReorderQuestions()
    {
        var orderedQuestions = _questions.OrderBy(q => q.Order).ToList();
        for (int i = 0; i < orderedQuestions.Count; i++)
        {
            orderedQuestions[i].UpdateOrder(i + 1);
        }
    }
}
