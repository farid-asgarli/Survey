namespace SurveyApp.Domain.Specifications;

/// <summary>
/// Standard sorting parameters for specification queries.
/// </summary>
public record SortingParameters
{
    /// <summary>
    /// Gets or sets the field to sort by.
    /// </summary>
    public string? SortBy { get; init; }

    /// <summary>
    /// Gets or sets whether to sort in descending order.
    /// </summary>
    public bool SortDescending { get; init; } = true;

    /// <summary>
    /// Gets the normalized sort field name (lowercase).
    /// </summary>
    public string? NormalizedSortBy => SortBy?.ToLowerInvariant();

    /// <summary>
    /// Creates default sorting parameters (by creation date, descending).
    /// </summary>
    public static SortingParameters Default => new() { SortDescending = true };

    /// <summary>
    /// Creates sorting parameters for a specific field.
    /// </summary>
    /// <param name="sortBy">The field to sort by.</param>
    /// <param name="descending">Whether to sort in descending order.</param>
    /// <returns>The sorting parameters.</returns>
    public static SortingParameters Create(string? sortBy, bool descending = true) =>
        new() { SortBy = sortBy, SortDescending = descending };
}
