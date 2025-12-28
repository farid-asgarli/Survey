using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Domain.Enums;

namespace SurveyApp.Application.Features.Namespaces.Commands.InviteUser;

public record InviteUserToNamespaceCommand : IRequest<Result<InviteUserResult>>
{
    public Guid NamespaceId { get; init; }
    public string Email { get; init; } = string.Empty;
    public NamespaceRole Role { get; init; }
}

public record InviteUserResult
{
    public Guid MembershipId { get; init; }
    public string Email { get; init; } = string.Empty;
    public NamespaceRole Role { get; init; }
    public bool IsNewUser { get; init; }
    public string? InviteToken { get; init; }
}
