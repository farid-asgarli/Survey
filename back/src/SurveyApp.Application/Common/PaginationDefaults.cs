namespace SurveyApp.Application.Common;

/// <summary>
/// Defines default values for pagination across the application.
/// </summary>
public static class PaginationDefaults
{
    /// <summary>
    /// Default page number (1-based).
    /// </summary>
    public const int DefaultPageNumber = 1;

    /// <summary>
    /// Default page size for list endpoints.
    /// </summary>
    public const int DefaultPageSize = 20;

    /// <summary>
    /// Maximum allowed page size.
    /// </summary>
    public const int MaxPageSize = 100;

    /// <summary>
    /// Minimum allowed page size.
    /// </summary>
    public const int MinPageSize = 1;
}
