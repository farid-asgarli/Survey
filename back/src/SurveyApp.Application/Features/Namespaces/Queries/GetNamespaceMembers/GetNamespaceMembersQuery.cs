using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.DTOs;

namespace SurveyApp.Application.Features.Namespaces.Queries.GetNamespaceMembers;

public record GetNamespaceMembersQuery : IRequest<Result<List<NamespaceMemberDto>>>
{
    public Guid NamespaceId { get; init; }
}
