namespace SurveyApp.Application.DTOs.Common;

/// <summary>
/// Base interface for all DTOs with an ID.
/// </summary>
public interface IEntityDto
{
    /// <summary>
    /// Gets the entity ID.
    /// </summary>
    Guid Id { get; }
}

/// <summary>
/// Interface for DTOs belonging to a namespace.
/// </summary>
public interface INamespacedDto : IEntityDto
{
    /// <summary>
    /// Gets the namespace ID.
    /// </summary>
    Guid NamespaceId { get; }
}

/// <summary>
/// Interface for DTOs with audit information.
/// </summary>
public interface IAuditableDto : IEntityDto
{
    /// <summary>
    /// Gets the creation timestamp.
    /// </summary>
    DateTime CreatedAt { get; }

    /// <summary>
    /// Gets the creator user ID.
    /// </summary>
    Guid? CreatedBy { get; }

    /// <summary>
    /// Gets the last update timestamp.
    /// </summary>
    DateTime? UpdatedAt { get; }

    /// <summary>
    /// Gets the last updater user ID.
    /// </summary>
    Guid? UpdatedBy { get; }
}

/// <summary>
/// Base record for summary DTOs (used in list views).
/// </summary>
/// <param name="Id">The entity ID.</param>
/// <param name="NamespaceId">The namespace ID.</param>
/// <param name="CreatedAt">Creation timestamp.</param>
/// <param name="CreatedBy">Member user ID.</param>
public abstract record SummaryDtoBase(
    Guid Id,
    Guid NamespaceId,
    DateTime CreatedAt,
    Guid? CreatedBy
) : INamespacedDto, IAuditableDto
{
    /// <inheritdoc />
    public DateTime? UpdatedAt { get; init; }

    /// <inheritdoc />
    public Guid? UpdatedBy { get; init; }
}

/// <summary>
/// Base record for detail DTOs (used in single entity views).
/// </summary>
/// <param name="Id">The entity ID.</param>
/// <param name="NamespaceId">The namespace ID.</param>
/// <param name="CreatedAt">Creation timestamp.</param>
/// <param name="CreatedBy">Member user ID.</param>
public abstract record DetailDtoBase(Guid Id, Guid NamespaceId, DateTime CreatedAt, Guid? CreatedBy)
    : INamespacedDto,
        IAuditableDto
{
    /// <inheritdoc />
    public DateTime? UpdatedAt { get; init; }

    /// <inheritdoc />
    public Guid? UpdatedBy { get; init; }
}
