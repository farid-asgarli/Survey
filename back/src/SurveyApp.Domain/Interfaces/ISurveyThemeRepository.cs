using SurveyApp.Domain.Entities;

namespace SurveyApp.Domain.Interfaces;

/// <summary>
/// Repository interface for SurveyTheme entities.
/// </summary>
public interface ISurveyThemeRepository
{
    /// <summary>
    /// Gets a theme by its ID.
    /// </summary>
    Task<SurveyTheme?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets all themes in a namespace.
    /// </summary>
    Task<IReadOnlyList<SurveyTheme>> GetByNamespaceIdAsync(
        Guid namespaceId,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Gets the default theme for a namespace.
    /// </summary>
    Task<SurveyTheme?> GetDefaultByNamespaceIdAsync(
        Guid namespaceId,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Gets themes by public visibility in a namespace.
    /// </summary>
    Task<IReadOnlyList<SurveyTheme>> GetPublicThemesByNamespaceIdAsync(
        Guid namespaceId,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Checks if a theme with the given name exists in the namespace.
    /// </summary>
    Task<bool> ExistsByNameAsync(
        Guid namespaceId,
        string name,
        Guid? excludeId = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Gets paginated themes for a namespace.
    /// </summary>
    Task<(IReadOnlyList<SurveyTheme> Items, int TotalCount)> GetPagedAsync(
        Guid namespaceId,
        int pageNumber,
        int pageSize,
        string? searchTerm = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Adds a new theme.
    /// </summary>
    void Add(SurveyTheme theme);

    /// <summary>
    /// Updates an existing theme.
    /// </summary>
    void Update(SurveyTheme theme);

    /// <summary>
    /// Removes a theme.
    /// </summary>
    void Remove(SurveyTheme theme);
}
