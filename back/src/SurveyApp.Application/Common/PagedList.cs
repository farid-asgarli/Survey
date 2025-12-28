namespace SurveyApp.Application.Common;

/// <summary>
/// Represents a paginated list of items.
/// </summary>
/// <typeparam name="T">The type of items in the list.</typeparam>
public class PagedList<T>
{
    /// <summary>
    /// Gets the items in the current page.
    /// </summary>
    public IReadOnlyList<T> Items { get; }

    /// <summary>
    /// Gets the current page number (1-based).
    /// </summary>
    public int PageNumber { get; }

    /// <summary>
    /// Gets the number of items per page.
    /// </summary>
    public int PageSize { get; }

    /// <summary>
    /// Gets the total number of items across all pages.
    /// </summary>
    public int TotalCount { get; }

    /// <summary>
    /// Gets the total number of pages.
    /// </summary>
    public int TotalPages { get; }

    /// <summary>
    /// Gets whether there is a previous page.
    /// </summary>
    public bool HasPreviousPage => PageNumber > 1;

    /// <summary>
    /// Gets whether there is a next page.
    /// </summary>
    public bool HasNextPage => PageNumber < TotalPages;

    private PagedList(IReadOnlyList<T> items, int pageNumber, int pageSize, int totalCount)
    {
        Items = items;
        PageNumber = pageNumber;
        PageSize = pageSize;
        TotalCount = totalCount;
        TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize);
    }

    /// <summary>
    /// Creates a new paged list (public constructor).
    /// </summary>
    public PagedList(IEnumerable<T> items, int pageNumber, int pageSize, int totalCount)
        : this(items.ToList().AsReadOnly(), pageNumber, pageSize, totalCount) { }

    /// <summary>
    /// Creates a new paged list.
    /// </summary>
    public static PagedList<T> Create(
        IReadOnlyList<T> items,
        int pageNumber,
        int pageSize,
        int totalCount
    )
    {
        return new PagedList<T>(items, pageNumber, pageSize, totalCount);
    }

    /// <summary>
    /// Creates an empty paged list.
    /// </summary>
    public static PagedList<T> Empty(int pageSize = 10)
    {
        return new PagedList<T>(Array.Empty<T>(), 1, pageSize, 0);
    }

    /// <summary>
    /// Maps the items to a different type.
    /// </summary>
    public PagedList<TDestination> Map<TDestination>(Func<T, TDestination> mapper)
    {
        var mappedItems = Items.Select(mapper).ToList();
        return PagedList<TDestination>.Create(mappedItems, PageNumber, PageSize, TotalCount);
    }
}
