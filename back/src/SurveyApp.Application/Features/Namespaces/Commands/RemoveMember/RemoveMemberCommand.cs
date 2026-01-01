using MediatR;
using SurveyApp.Application.Common;

namespace SurveyApp.Application.Features.Namespaces.Commands.RemoveMember;

public record RemoveMemberCommand : IRequest<Result<Unit>>
{
    public Guid NamespaceId { get; init; }
    public Guid MembershipId { get; init; }
}
