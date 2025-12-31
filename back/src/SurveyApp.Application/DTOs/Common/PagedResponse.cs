namespace SurveyApp.Application.DTOs.Common;

/// <summary>
/// Represents a paginated response with items and pagination metadata.
/// </summary>
/// <typeparam name="T">The item type.</typeparam>
public class PagedResponse<T>
{
    /// <summary>
    /// Gets or sets the items on the current page.
    /// </summary>
    public IReadOnlyList<T> Items { get; init; } = Array.Empty<T>();

    /// <summary>
    /// Gets or sets the current page number (1-based).
    /// </summary>
    public int PageNumber { get; init; }

    /// <summary>
    /// Gets or sets the page size.
    /// </summary>
    public int PageSize { get; init; }

    /// <summary>
    /// Gets or sets the total number of items across all pages.
    /// </summary>
    public int TotalCount { get; init; }

    /// <summary>
    /// Gets the total number of pages.
    /// </summary>
    public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);

    /// <summary>
    /// Gets whether there is a previous page.
    /// </summary>
    public bool HasPreviousPage => PageNumber > 1;

    /// <summary>
    /// Gets whether there is a next page.
    /// </summary>
    public bool HasNextPage => PageNumber < TotalPages;

    /// <summary>
    /// Creates a new paged response.
    /// </summary>
    public static PagedResponse<T> Create(
        IReadOnlyList<T> items,
        int pageNumber,
        int pageSize,
        int totalCount
    )
    {
        return new PagedResponse<T>
        {
            Items = items,
            PageNumber = pageNumber,
            PageSize = pageSize,
            TotalCount = totalCount,
        };
    }

    /// <summary>
    /// Creates a paged response from a tuple.
    /// </summary>
    public static PagedResponse<T> FromTuple(
        (IReadOnlyList<T> Items, int TotalCount) tuple,
        int pageNumber,
        int pageSize
    )
    {
        return Create(tuple.Items, pageNumber, pageSize, tuple.TotalCount);
    }

    /// <summary>
    /// Maps items to a different type.
    /// </summary>
    public PagedResponse<TNew> Map<TNew>(Func<T, TNew> mapper)
    {
        return new PagedResponse<TNew>
        {
            Items = [.. Items.Select(mapper)],
            PageNumber = PageNumber,
            PageSize = PageSize,
            TotalCount = TotalCount,
        };
    }

    /// <summary>
    /// Creates an empty paged response.
    /// </summary>
    public static PagedResponse<T> Empty(int pageNumber = 1, int pageSize = 10)
    {
        return new PagedResponse<T>
        {
            Items = Array.Empty<T>(),
            PageNumber = pageNumber,
            PageSize = pageSize,
            TotalCount = 0,
        };
    }
}

/// <summary>
/// Request parameters for pagination.
/// </summary>
public record PaginationRequest
{
    /// <summary>
    /// Gets or sets the page number (1-based).
    /// </summary>
    public int PageNumber { get; init; } = 1;

    /// <summary>
    /// Gets or sets the page size.
    /// </summary>
    public int PageSize { get; init; } = 10;

    /// <summary>
    /// Gets or sets the search term.
    /// </summary>
    public string? SearchTerm { get; init; }

    /// <summary>
    /// Gets or sets the sort field.
    /// </summary>
    public string? SortBy { get; init; }

    /// <summary>
    /// Gets or sets whether to sort descending.
    /// </summary>
    public bool SortDescending { get; init; }

    /// <summary>
    /// Validates and normalizes the pagination parameters.
    /// </summary>
    public PaginationRequest Normalized(int maxPageSize = 100)
    {
        return this with
        {
            PageNumber = Math.Max(1, PageNumber),
            PageSize = Math.Clamp(PageSize, 1, maxPageSize),
        };
    }
}
