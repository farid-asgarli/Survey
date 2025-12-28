namespace SurveyApp.Domain.Common;

/// <summary>
/// Interface for auditable entities that track creation, modification, and deletion.
/// </summary>
public interface IAuditable
{
    /// <summary>
    /// The date and time when the entity was created.
    /// </summary>
    DateTime CreatedAt { get; set; }

    /// <summary>
    /// The ID of the user who created the entity.
    /// </summary>
    Guid? CreatedBy { get; set; }

    /// <summary>
    /// The date and time when the entity was last updated.
    /// </summary>
    DateTime? UpdatedAt { get; set; }

    /// <summary>
    /// The ID of the user who last updated the entity.
    /// </summary>
    Guid? UpdatedBy { get; set; }

    /// <summary>
    /// Indicates whether the entity has been soft-deleted.
    /// </summary>
    bool IsDeleted { get; set; }

    /// <summary>
    /// The date and time when the entity was soft-deleted.
    /// </summary>
    DateTime? DeletedAt { get; set; }

    /// <summary>
    /// The ID of the user who deleted the entity.
    /// </summary>
    Guid? DeletedBy { get; set; }
}
