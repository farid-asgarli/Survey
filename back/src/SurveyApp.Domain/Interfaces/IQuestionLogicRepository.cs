using SurveyApp.Domain.Entities;

namespace SurveyApp.Domain.Interfaces;

/// <summary>
/// Repository interface for QuestionLogic entities.
/// </summary>
public interface IQuestionLogicRepository
{
    /// <summary>
    /// Gets a question logic by its ID.
    /// </summary>
    Task<QuestionLogic?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a question logic by ID with related questions loaded.
    /// </summary>
    Task<QuestionLogic?> GetByIdWithQuestionsAsync(
        Guid id,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Gets all logic rules for a specific question.
    /// </summary>
    Task<IReadOnlyList<QuestionLogic>> GetByQuestionIdAsync(
        Guid questionId,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Gets all logic rules for a survey.
    /// </summary>
    Task<IReadOnlyList<QuestionLogic>> GetBySurveyIdAsync(
        Guid surveyId,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Gets logic rules that use a specific question as the source (trigger).
    /// </summary>
    Task<IReadOnlyList<QuestionLogic>> GetBySourceQuestionIdAsync(
        Guid sourceQuestionId,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Gets logic rules that target a specific question (for JumpTo action).
    /// </summary>
    Task<IReadOnlyList<QuestionLogic>> GetByTargetQuestionIdAsync(
        Guid targetQuestionId,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Checks if a logic rule exists.
    /// </summary>
    Task<bool> ExistsAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the maximum priority for a question's logic rules.
    /// </summary>
    Task<int> GetMaxPriorityForQuestionAsync(
        Guid questionId,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Adds a new question logic rule.
    /// </summary>
    void Add(QuestionLogic questionLogic);

    /// <summary>
    /// Updates an existing question logic rule.
    /// </summary>
    void Update(QuestionLogic questionLogic);

    /// <summary>
    /// Removes a question logic rule.
    /// </summary>
    void Remove(QuestionLogic questionLogic);

    /// <summary>
    /// Removes all logic rules for a specific question.
    /// </summary>
    Task RemoveByQuestionIdAsync(Guid questionId, CancellationToken cancellationToken = default);
}
