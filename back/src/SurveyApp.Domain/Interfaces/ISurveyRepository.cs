using SurveyApp.Domain.Entities;
using SurveyApp.Domain.Enums;

namespace SurveyApp.Domain.Interfaces;

/// <summary>
/// Repository interface for Survey entities.
/// </summary>
public interface ISurveyRepository
{
    /// <summary>
    /// Gets a survey by its ID.
    /// </summary>
    Task<Survey?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a survey by its ID with questions loaded.
    /// </summary>
    Task<Survey?> GetByIdWithQuestionsAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a survey with its questions.
    /// </summary>
    Task<Survey?> GetWithQuestionsAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a survey by its access token.
    /// </summary>
    Task<Survey?> GetByAccessTokenAsync(
        string accessToken,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Gets a survey by its share token.
    /// </summary>
    Task<Survey?> GetByShareTokenAsync(
        string shareToken,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Gets all surveys in a namespace.
    /// </summary>
    Task<IReadOnlyList<Survey>> GetByNamespaceIdAsync(
        Guid namespaceId,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Gets surveys by status in a namespace.
    /// </summary>
    Task<IReadOnlyList<Survey>> GetByStatusAsync(
        Guid namespaceId,
        SurveyStatus status,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Gets surveys created by a specific user.
    /// </summary>
    Task<IReadOnlyList<Survey>> GetByCreatorAsync(
        Guid namespaceId,
        Guid creatorId,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Gets paginated surveys for a namespace.
    /// </summary>
    /// <param name="namespaceId">The namespace to filter by</param>
    /// <param name="pageNumber">Page number (1-based)</param>
    /// <param name="pageSize">Number of items per page</param>
    /// <param name="searchTerm">Optional search term for title/description</param>
    /// <param name="status">Optional status filter</param>
    /// <param name="sortBy">Sort field: "title", "createdAt", "updatedAt", "status", "responseCount" (default: "createdAt")</param>
    /// <param name="sortDescending">Sort direction (default: true for descending)</param>
    /// <param name="cancellationToken">Cancellation token</param>
    Task<(IReadOnlyList<Survey> Items, int TotalCount)> GetPagedAsync(
        Guid namespaceId,
        int pageNumber,
        int pageSize,
        string? searchTerm = null,
        SurveyStatus? status = null,
        string? sortBy = null,
        bool sortDescending = true,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Adds a new survey.
    /// </summary>
    Task<Survey> AddAsync(Survey survey, CancellationToken cancellationToken = default);

    /// <summary>
    /// Adds a new question to the context (for explicit tracking).
    /// </summary>
    Task AddQuestionAsync(Question question, CancellationToken cancellationToken = default);

    /// <summary>
    /// Adds a new survey translation to the context (for explicit tracking).
    /// </summary>
    Task AddTranslationAsync(
        SurveyTranslation translation,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Adds a new question translation to the context (for explicit tracking).
    /// </summary>
    Task AddQuestionTranslationAsync(
        QuestionTranslation translation,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Updates an existing survey.
    /// </summary>
    void Update(Survey survey);

    /// <summary>
    /// Deletes a survey.
    /// </summary>
    void Delete(Survey survey);
}
