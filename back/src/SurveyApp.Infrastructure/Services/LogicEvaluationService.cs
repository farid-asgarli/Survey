using SurveyApp.Application.Services;
using SurveyApp.Domain.Entities;
using SurveyApp.Domain.Enums;

namespace SurveyApp.Infrastructure.Services;

/// <summary>
/// Implementation of the logic evaluation service.
/// </summary>
public class LogicEvaluationService : ILogicEvaluationService
{
    /// <inheritdoc />
    public bool EvaluateCondition(QuestionLogic logic, string? answerValue)
    {
        return logic.Operator switch
        {
            LogicOperator.Equals => string.Equals(
                answerValue,
                logic.ConditionValue,
                StringComparison.OrdinalIgnoreCase
            ),
            LogicOperator.NotEquals => !string.Equals(
                answerValue,
                logic.ConditionValue,
                StringComparison.OrdinalIgnoreCase
            ),
            LogicOperator.Contains => answerValue?.Contains(
                logic.ConditionValue,
                StringComparison.OrdinalIgnoreCase
            ) ?? false,
            LogicOperator.NotContains => !(
                answerValue?.Contains(logic.ConditionValue, StringComparison.OrdinalIgnoreCase)
                ?? false
            ),
            LogicOperator.GreaterThan => CompareNumeric(answerValue, logic.ConditionValue) > 0,
            LogicOperator.LessThan => CompareNumeric(answerValue, logic.ConditionValue) < 0,
            LogicOperator.GreaterThanOrEquals => CompareNumeric(answerValue, logic.ConditionValue)
                >= 0,
            LogicOperator.LessThanOrEquals => CompareNumeric(answerValue, logic.ConditionValue)
                <= 0,
            LogicOperator.IsEmpty => string.IsNullOrWhiteSpace(answerValue),
            LogicOperator.IsNotEmpty => !string.IsNullOrWhiteSpace(answerValue),
            LogicOperator.IsAnswered => !string.IsNullOrWhiteSpace(answerValue),
            LogicOperator.IsNotAnswered => string.IsNullOrWhiteSpace(answerValue),
            _ => false,
        };
    }

    /// <inheritdoc />
    public IReadOnlyList<Guid> GetVisibleQuestions(
        Survey survey,
        IReadOnlyList<QuestionLogic> allLogicRules,
        IDictionary<Guid, string?> answers
    )
    {
        var visibleQuestions = new List<Guid>();
        var questionLogicMap = allLogicRules
            .GroupBy(l => l.QuestionId)
            .ToDictionary(g => g.Key, g => g.OrderBy(l => l.Priority).ToList());

        foreach (var question in survey.Questions.OrderBy(q => q.Order))
        {
            if (
                !questionLogicMap.TryGetValue(question.Id, out var logicRules)
                || logicRules.Count == 0
            )
            {
                // No logic rules - question is always visible
                visibleQuestions.Add(question.Id);
                continue;
            }

            var isVisible = EvaluateQuestionVisibility(logicRules, answers);
            if (isVisible)
            {
                visibleQuestions.Add(question.Id);
            }
        }

        return visibleQuestions;
    }

    /// <inheritdoc />
    public Guid? GetNextQuestion(
        Survey survey,
        IReadOnlyList<QuestionLogic> allLogicRules,
        Question currentQuestion,
        IDictionary<Guid, string?> answers
    )
    {
        // Check for JumpTo or EndSurvey actions triggered by current answer
        var currentAnswer = answers.TryGetValue(currentQuestion.Id, out var value) ? value : null;
        var jumpLogic = allLogicRules
            .Where(l => l.SourceQuestionId == currentQuestion.Id)
            .Where(l => l.Action is LogicAction.JumpTo or LogicAction.EndSurvey)
            .OrderBy(l => l.Priority)
            .FirstOrDefault(l => EvaluateCondition(l, currentAnswer));

        if (jumpLogic != null)
        {
            if (jumpLogic.Action == LogicAction.EndSurvey)
            {
                return null; // Signal to end survey
            }

            if (jumpLogic.Action == LogicAction.JumpTo && jumpLogic.TargetQuestionId.HasValue)
            {
                return jumpLogic.TargetQuestionId.Value;
            }
        }

        // Get visible questions and find the next one after current
        var visibleQuestions = GetVisibleQuestions(survey, allLogicRules, answers);
        var orderedQuestions = survey
            .Questions.OrderBy(q => q.Order)
            .Where(q => visibleQuestions.Contains(q.Id))
            .ToList();

        var currentIndex = orderedQuestions.FindIndex(q => q.Id == currentQuestion.Id);
        if (currentIndex < 0 || currentIndex >= orderedQuestions.Count - 1)
        {
            return null; // End of survey or current question not found
        }

        return orderedQuestions[currentIndex + 1].Id;
    }

    /// <inheritdoc />
    public bool ShouldEndSurvey(
        IReadOnlyList<QuestionLogic> allLogicRules,
        IDictionary<Guid, string?> answers
    )
    {
        var endSurveyRules = allLogicRules
            .Where(l => l.Action == LogicAction.EndSurvey)
            .OrderBy(l => l.Priority);

        foreach (var rule in endSurveyRules)
        {
            var answerValue = answers.TryGetValue(rule.SourceQuestionId, out var value)
                ? value
                : null;
            if (EvaluateCondition(rule, answerValue))
            {
                return true;
            }
        }

        return false;
    }

    /// <summary>
    /// Evaluates whether a question should be visible based on its logic rules.
    /// </summary>
    private bool EvaluateQuestionVisibility(
        List<QuestionLogic> logicRules,
        IDictionary<Guid, string?> answers
    )
    {
        // Default visibility is true unless a Hide condition is met
        // or a Show condition is not met (when Show rules exist)
        var showRules = logicRules.Where(l => l.Action == LogicAction.Show).ToList();
        var hideRules = logicRules.Where(l => l.Action == LogicAction.Hide).ToList();

        // If there are Hide rules, check if any are triggered
        foreach (var hideRule in hideRules)
        {
            var answerValue = answers.TryGetValue(hideRule.SourceQuestionId, out var value)
                ? value
                : null;
            if (EvaluateCondition(hideRule, answerValue))
            {
                return false; // Hide condition met
            }
        }

        // If there are Show rules, at least one must be met
        if (showRules.Count > 0)
        {
            foreach (var showRule in showRules)
            {
                var answerValue = answers.TryGetValue(showRule.SourceQuestionId, out var value)
                    ? value
                    : null;
                if (EvaluateCondition(showRule, answerValue))
                {
                    return true; // Show condition met
                }
            }
            return false; // No Show condition met
        }

        // No Show rules and no Hide rules triggered - question is visible
        return true;
    }

    /// <summary>
    /// Compares two string values as numbers.
    /// </summary>
    private static int CompareNumeric(string? value1, string? value2)
    {
        if (decimal.TryParse(value1, out var num1) && decimal.TryParse(value2, out var num2))
        {
            return num1.CompareTo(num2);
        }

        // Fall back to string comparison if not numeric
        return string.Compare(value1, value2, StringComparison.OrdinalIgnoreCase);
    }
}
