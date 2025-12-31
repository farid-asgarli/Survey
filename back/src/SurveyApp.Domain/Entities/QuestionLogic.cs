using SurveyApp.Domain.Common;
using SurveyApp.Domain.Enums;

namespace SurveyApp.Domain.Entities;

/// <summary>
/// Represents conditional logic for a survey question.
/// Defines rules that control question visibility and survey flow based on answers.
/// </summary>
public class QuestionLogic : Entity<Guid>
{
    /// <summary>
    /// Gets the question ID this logic belongs to (the affected question).
    /// </summary>
    public Guid QuestionId { get; private set; }

    /// <summary>
    /// Gets the source question ID whose answer triggers this logic.
    /// </summary>
    public Guid SourceQuestionId { get; private set; }

    /// <summary>
    /// Gets the comparison operator for evaluating the condition.
    /// </summary>
    public LogicOperator Operator { get; private set; }

    /// <summary>
    /// Gets the value to compare against the source question's answer.
    /// </summary>
    public string ConditionValue { get; private set; } = null!;

    /// <summary>
    /// Gets the action to take when the condition is met.
    /// </summary>
    public LogicAction Action { get; private set; }

    /// <summary>
    /// Gets the target question ID for JumpTo action.
    /// </summary>
    public Guid? TargetQuestionId { get; private set; }

    /// <summary>
    /// Gets the priority/order for evaluating multiple logic rules.
    /// Lower values are evaluated first.
    /// </summary>
    public int Priority { get; private set; }

    /// <summary>
    /// Navigation property to the question this logic affects.
    /// </summary>
    public Question Question { get; private set; } = null!;

    /// <summary>
    /// Navigation property to the source question whose answer triggers this logic.
    /// </summary>
    public Question SourceQuestion { get; private set; } = null!;

    /// <summary>
    /// Navigation property to the target question for JumpTo action.
    /// </summary>
    public Question? TargetQuestion { get; private set; }

    private QuestionLogic() { }

    private QuestionLogic(
        Guid id,
        Guid questionId,
        Guid sourceQuestionId,
        LogicOperator @operator,
        string conditionValue,
        LogicAction action,
        Guid? targetQuestionId,
        int priority
    )
        : base(id)
    {
        QuestionId = questionId;
        SourceQuestionId = sourceQuestionId;
        Operator = @operator;
        ConditionValue = conditionValue;
        Action = action;
        TargetQuestionId = targetQuestionId;
        Priority = priority;
    }

    /// <summary>
    /// Creates a new question logic rule.
    /// </summary>
    /// <param name="questionId">The question this logic affects.</param>
    /// <param name="sourceQuestionId">The question whose answer triggers this logic.</param>
    /// <param name="operator">The comparison operator.</param>
    /// <param name="conditionValue">The value to compare against.</param>
    /// <param name="action">The action to take when condition is met.</param>
    /// <param name="targetQuestionId">Optional target question for JumpTo action.</param>
    /// <param name="priority">The evaluation priority (lower = first).</param>
    /// <returns>A new QuestionLogic instance.</returns>
    public static QuestionLogic Create(
        Guid questionId,
        Guid sourceQuestionId,
        LogicOperator @operator,
        string conditionValue,
        LogicAction action,
        Guid? targetQuestionId = null,
        int priority = 0
    )
    {
        if (questionId == Guid.Empty)
            throw new DomainException("Domain.QuestionLogic.QuestionIdEmpty");

        if (sourceQuestionId == Guid.Empty)
            throw new DomainException("Domain.QuestionLogic.SourceQuestionIdEmpty");

        if (action == LogicAction.JumpTo && !targetQuestionId.HasValue)
            throw new DomainException("Domain.QuestionLogic.TargetQuestionRequiredForJumpTo");

        // Validate that condition value is not required for certain operators
        var requiresConditionValue =
            @operator
                is not (
                    LogicOperator.IsEmpty
                    or LogicOperator.IsNotEmpty
                    or LogicOperator.IsAnswered
                    or LogicOperator.IsNotAnswered
                );

        if (requiresConditionValue && string.IsNullOrWhiteSpace(conditionValue))
            throw new DomainException("Domain.QuestionLogic.ConditionValueRequired");

        return new QuestionLogic(
            Guid.NewGuid(),
            questionId,
            sourceQuestionId,
            @operator,
            conditionValue ?? string.Empty,
            action,
            targetQuestionId,
            priority
        );
    }

    /// <summary>
    /// Updates the logic operator.
    /// </summary>
    public void UpdateOperator(LogicOperator @operator)
    {
        Operator = @operator;
    }

    /// <summary>
    /// Updates the condition value.
    /// </summary>
    public void UpdateConditionValue(string conditionValue)
    {
        var requiresConditionValue =
            Operator
                is not (
                    LogicOperator.IsEmpty
                    or LogicOperator.IsNotEmpty
                    or LogicOperator.IsAnswered
                    or LogicOperator.IsNotAnswered
                );

        if (requiresConditionValue && string.IsNullOrWhiteSpace(conditionValue))
            throw new DomainException("Domain.QuestionLogic.ConditionValueRequired");

        ConditionValue = conditionValue ?? string.Empty;
    }

    /// <summary>
    /// Updates the action.
    /// </summary>
    public void UpdateAction(LogicAction action, Guid? targetQuestionId = null)
    {
        if (action == LogicAction.JumpTo && !targetQuestionId.HasValue)
            throw new DomainException("Domain.QuestionLogic.TargetQuestionRequiredForJumpTo");

        Action = action;
        TargetQuestionId = action == LogicAction.JumpTo ? targetQuestionId : null;
    }

    /// <summary>
    /// Updates the priority.
    /// </summary>
    public void UpdatePriority(int priority)
    {
        if (priority < 0)
            throw new DomainException("Domain.QuestionLogic.PriorityNonNegative");

        Priority = priority;
    }

    /// <summary>
    /// Updates the source question.
    /// </summary>
    public void UpdateSourceQuestion(Guid sourceQuestionId)
    {
        if (sourceQuestionId == Guid.Empty)
            throw new DomainException("Domain.QuestionLogic.SourceQuestionIdEmpty");

        SourceQuestionId = sourceQuestionId;
    }

    /// <summary>
    /// Updates multiple properties at once.
    /// </summary>
    public void Update(
        Guid sourceQuestionId,
        LogicOperator @operator,
        string conditionValue,
        LogicAction action,
        Guid? targetQuestionId,
        int priority
    )
    {
        UpdateSourceQuestion(sourceQuestionId);
        UpdateOperator(@operator);
        UpdateConditionValue(conditionValue);
        UpdateAction(action, targetQuestionId);
        UpdatePriority(priority);
    }
}
