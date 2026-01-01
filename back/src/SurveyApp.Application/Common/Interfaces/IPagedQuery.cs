namespace SurveyApp.Application.Common.Interfaces;

/// <summary>
/// Interface for queries that support pagination.
/// Queries implementing this interface will have consistent pagination behavior
/// and can leverage shared validation rules.
/// </summary>
public interface IPagedQuery
{
    /// <summary>
    /// The page number to retrieve (1-based).
    /// </summary>
    int PageNumber { get; }

    /// <summary>
    /// The number of items per page.
    /// </summary>
    int PageSize { get; }
}

/// <summary>
/// Base record for paginated queries that provides standard pagination properties.
/// Inherit from this record to get PageNumber and PageSize with default values.
/// </summary>
public abstract record PagedQuery : IPagedQuery
{
    /// <summary>
    /// The page number to retrieve (1-based).
    /// </summary>
    public int PageNumber { get; init; } = PaginationDefaults.DefaultPageNumber;

    /// <summary>
    /// The number of items per page.
    /// </summary>
    public int PageSize { get; init; } = PaginationDefaults.DefaultPageSize;
}
