namespace SurveyApp.Domain.Specifications;

/// <summary>
/// Standard paging parameters for specification queries.
/// </summary>
public record PagingParameters
{
    /// <summary>
    /// Default page size when not specified.
    /// </summary>
    public const int DefaultPageSize = 20;

    /// <summary>
    /// Maximum allowed page size.
    /// </summary>
    public const int MaxPageSize = 100;

    private int _pageNumber = 1;
    private int _pageSize = DefaultPageSize;

    /// <summary>
    /// Gets or sets the page number (1-based).
    /// </summary>
    public int PageNumber
    {
        get => _pageNumber;
        set => _pageNumber = value < 1 ? 1 : value;
    }

    /// <summary>
    /// Gets or sets the number of items per page.
    /// </summary>
    public int PageSize
    {
        get => _pageSize;
        set =>
            _pageSize = value > MaxPageSize ? MaxPageSize : (value < 1 ? DefaultPageSize : value);
    }

    /// <summary>
    /// Gets the number of items to skip.
    /// </summary>
    public int Skip => (PageNumber - 1) * PageSize;

    /// <summary>
    /// Creates default paging parameters.
    /// </summary>
    public static PagingParameters Default => new();

    /// <summary>
    /// Creates paging parameters for a specific page.
    /// </summary>
    /// <param name="pageNumber">The page number (1-based).</param>
    /// <param name="pageSize">The number of items per page.</param>
    /// <returns>The paging parameters.</returns>
    public static PagingParameters Create(int pageNumber, int pageSize) =>
        new() { PageNumber = pageNumber, PageSize = pageSize };
}
