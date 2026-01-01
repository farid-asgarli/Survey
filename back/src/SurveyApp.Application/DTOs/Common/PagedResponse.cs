using SurveyApp.Application.Common;

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
    public IReadOnlyList<T> Items { get; init; } = [];

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
    public static PagedResponse<T> Empty(
        int pageNumber = PaginationDefaults.DefaultPageNumber,
        int pageSize = PaginationDefaults.DefaultPageSize
    )
    {
        return new PagedResponse<T>
        {
            Items = [],
            PageNumber = pageNumber,
            PageSize = pageSize,
            TotalCount = 0,
        };
    }
}
