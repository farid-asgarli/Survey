using SurveyApp.Domain.Entities;
using SurveyApp.Domain.Enums;

namespace SurveyApp.Application.Services;

/// <summary>
/// Service for evaluating conditional logic rules.
/// </summary>
public interface ILogicEvaluationService
{
    /// <summary>
    /// Evaluates a single condition against an answer value.
    /// </summary>
    /// <param name="logic">The logic rule to evaluate.</param>
    /// <param name="answerValue">The answer value to evaluate against.</param>
    /// <returns>True if the condition is met, false otherwise.</returns>
    bool EvaluateCondition(QuestionLogic logic, string? answerValue);

    /// <summary>
    /// Gets the list of visible questions based on current answers.
    /// </summary>
    /// <param name="survey">The survey containing the questions.</param>
    /// <param name="allLogicRules">All logic rules for the survey.</param>
    /// <param name="answers">Dictionary of question IDs to answer values.</param>
    /// <returns>List of visible question IDs.</returns>
    IReadOnlyList<Guid> GetVisibleQuestions(
        Survey survey,
        IReadOnlyList<QuestionLogic> allLogicRules,
        IDictionary<Guid, string?> answers
    );

    /// <summary>
    /// Gets the next question to show based on current answers and logic.
    /// </summary>
    /// <param name="survey">The survey containing the questions.</param>
    /// <param name="allLogicRules">All logic rules for the survey.</param>
    /// <param name="currentQuestion">The current question.</param>
    /// <param name="answers">Dictionary of question IDs to answer values.</param>
    /// <returns>The next question ID, or null if survey should end.</returns>
    Guid? GetNextQuestion(
        Survey survey,
        IReadOnlyList<QuestionLogic> allLogicRules,
        Question currentQuestion,
        IDictionary<Guid, string?> answers
    );

    /// <summary>
    /// Determines if the survey should end based on current answers.
    /// </summary>
    /// <param name="allLogicRules">All logic rules for the survey.</param>
    /// <param name="answers">Dictionary of question IDs to answer values.</param>
    /// <returns>True if survey should end, false otherwise.</returns>
    bool ShouldEndSurvey(
        IReadOnlyList<QuestionLogic> allLogicRules,
        IDictionary<Guid, string?> answers
    );
}
