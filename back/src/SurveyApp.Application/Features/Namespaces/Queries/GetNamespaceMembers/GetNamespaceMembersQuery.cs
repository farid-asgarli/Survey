using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Application.DTOs.Common;

namespace SurveyApp.Application.Features.Namespaces.Queries.GetNamespaceMembers;

/// <summary>
/// Query to get paginated members of a namespace.
/// </summary>
public record GetNamespaceMembersQuery
    : PagedQuery,
        IRequest<Result<PagedResponse<NamespaceMemberDto>>>
{
    public Guid NamespaceId { get; init; }
}
