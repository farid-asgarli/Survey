namespace SurveyApp.Domain.Common;

/// <summary>
/// Base class for translation entities.
/// Translations do not inherit full audit fields to keep them lightweight.
/// </summary>
public abstract class Translation
{
    /// <summary>
    /// Gets the unique identifier for this translation.
    /// </summary>
    public Guid Id { get; protected set; }

    /// <summary>
    /// Gets the ISO 639-1 language code (e.g., "en", "es", "fr").
    /// </summary>
    public string LanguageCode { get; protected set; } = null!;

    /// <summary>
    /// Gets whether this is the default/fallback translation.
    /// </summary>
    public bool IsDefault { get; protected set; }

    /// <summary>
    /// Gets the concurrency token for optimistic concurrency control.
    /// Uses PostgreSQL's xmin system column which is automatically updated on each row modification.
    /// </summary>
    public uint Version { get; protected set; }

    /// <summary>
    /// Gets the date and time when this translation was last modified.
    /// </summary>
    public DateTime? LastModifiedAt { get; protected set; }

    /// <summary>
    /// Gets the ID of the user who last modified this translation.
    /// </summary>
    public Guid? LastModifiedBy { get; protected set; }

    protected Translation() { }

    protected Translation(Guid id, string languageCode, bool isDefault = false)
    {
        Id = id;
        LanguageCode = languageCode.ToLowerInvariant();
        IsDefault = isDefault;
    }

    /// <summary>
    /// Sets this translation as the default.
    /// </summary>
    public void SetAsDefault()
    {
        IsDefault = true;
    }

    /// <summary>
    /// Removes the default status from this translation.
    /// </summary>
    public void RemoveDefault()
    {
        IsDefault = false;
    }

    /// <summary>
    /// Updates the last modified tracking.
    /// </summary>
    protected void MarkAsModified(Guid? userId = null)
    {
        LastModifiedAt = DateTime.UtcNow;
        LastModifiedBy = userId;
    }
}
