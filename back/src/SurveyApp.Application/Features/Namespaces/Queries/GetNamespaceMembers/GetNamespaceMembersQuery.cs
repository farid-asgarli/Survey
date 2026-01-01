using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.DTOs;
using SurveyApp.Application.DTOs.Common;

namespace SurveyApp.Application.Features.Namespaces.Queries.GetNamespaceMembers;

/// <summary>
/// Query to get paginated members of a namespace.
/// </summary>
public record GetNamespaceMembersQuery : IRequest<Result<PagedResponse<NamespaceMemberDto>>>
{
    public Guid NamespaceId { get; init; }
    public int PageNumber { get; init; } = PaginationDefaults.DefaultPageNumber;
    public int PageSize { get; init; } = PaginationDefaults.DefaultPageSize;
}
