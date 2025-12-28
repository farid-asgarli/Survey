using SurveyApp.Domain.Entities;
using SurveyApp.Domain.Enums;

namespace SurveyApp.Domain.Interfaces;

/// <summary>
/// Repository interface for EmailTemplate entities.
/// </summary>
public interface IEmailTemplateRepository
{
    /// <summary>
    /// Gets a template by its ID.
    /// </summary>
    Task<EmailTemplate?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets all templates in a namespace.
    /// </summary>
    Task<IReadOnlyList<EmailTemplate>> GetByNamespaceIdAsync(
        Guid namespaceId,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Gets the default template for a specific type in a namespace.
    /// </summary>
    Task<EmailTemplate?> GetDefaultByTypeAsync(
        Guid namespaceId,
        EmailTemplateType type,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Gets templates by type in a namespace.
    /// </summary>
    Task<IReadOnlyList<EmailTemplate>> GetByTypeAsync(
        Guid namespaceId,
        EmailTemplateType type,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Checks if a template with the given name exists in the namespace.
    /// </summary>
    Task<bool> ExistsByNameAsync(
        Guid namespaceId,
        string name,
        Guid? excludeId = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Gets paginated templates for a namespace.
    /// </summary>
    Task<(IReadOnlyList<EmailTemplate> Items, int TotalCount)> GetPagedAsync(
        Guid namespaceId,
        int pageNumber,
        int pageSize,
        string? searchTerm = null,
        EmailTemplateType? type = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Adds a new template.
    /// </summary>
    void Add(EmailTemplate template);

    /// <summary>
    /// Updates an existing template.
    /// </summary>
    void Update(EmailTemplate template);

    /// <summary>
    /// Deletes a template (soft delete).
    /// </summary>
    void Delete(EmailTemplate template);
}
