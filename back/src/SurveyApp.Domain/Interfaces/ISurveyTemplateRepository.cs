using SurveyApp.Domain.Entities;

namespace SurveyApp.Domain.Interfaces;

/// <summary>
/// Repository interface for SurveyTemplate entities.
/// </summary>
public interface ISurveyTemplateRepository
{
    /// <summary>
    /// Gets a template by its ID.
    /// </summary>
    Task<SurveyTemplate?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a template by its ID with questions loaded.
    /// </summary>
    Task<SurveyTemplate?> GetByIdWithQuestionsAsync(
        Guid id,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Gets all templates in a namespace.
    /// </summary>
    Task<IReadOnlyList<SurveyTemplate>> GetByNamespaceIdAsync(
        Guid namespaceId,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Gets public templates in a namespace.
    /// </summary>
    Task<IReadOnlyList<SurveyTemplate>> GetPublicByNamespaceIdAsync(
        Guid namespaceId,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Gets templates by category in a namespace.
    /// </summary>
    Task<IReadOnlyList<SurveyTemplate>> GetByCategoryAsync(
        Guid namespaceId,
        string category,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Gets templates created by a specific user.
    /// </summary>
    Task<IReadOnlyList<SurveyTemplate>> GetByCreatorAsync(
        Guid namespaceId,
        Guid creatorId,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Gets paginated templates for a namespace.
    /// </summary>
    Task<(IReadOnlyList<SurveyTemplate> Items, int TotalCount)> GetPagedAsync(
        Guid namespaceId,
        int pageNumber,
        int pageSize,
        string? searchTerm = null,
        string? category = null,
        bool? isPublic = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Gets all unique categories in a namespace.
    /// </summary>
    Task<IReadOnlyList<string>> GetCategoriesAsync(
        Guid namespaceId,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Adds a new template.
    /// </summary>
    Task<SurveyTemplate> AddAsync(
        SurveyTemplate template,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Updates an existing template.
    /// </summary>
    void Update(SurveyTemplate template);

    /// <summary>
    /// Deletes a template.
    /// </summary>
    void Delete(SurveyTemplate template);

    /// <summary>
    /// Checks if a template with the given name exists in a namespace.
    /// </summary>
    Task<bool> ExistsByNameAsync(
        Guid namespaceId,
        string name,
        Guid? excludeId = null,
        CancellationToken cancellationToken = default
    );
}
