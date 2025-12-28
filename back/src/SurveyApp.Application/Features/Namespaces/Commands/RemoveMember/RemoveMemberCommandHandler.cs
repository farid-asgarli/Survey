using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Domain.Entities;
using SurveyApp.Domain.Enums;
using SurveyApp.Domain.Interfaces;

namespace SurveyApp.Application.Features.Namespaces.Commands.RemoveMember;

public class RemoveMemberCommandHandler(
    INamespaceRepository namespaceRepository,
    IUnitOfWork unitOfWork,
    ICurrentUserService currentUserService
) : IRequestHandler<RemoveMemberCommand, Result<bool>>
{
    private readonly INamespaceRepository _namespaceRepository = namespaceRepository;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;
    private readonly ICurrentUserService _currentUserService = currentUserService;

    public async Task<Result<bool>> Handle(
        RemoveMemberCommand request,
        CancellationToken cancellationToken
    )
    {
        var @namespace = await _namespaceRepository.GetByIdAsync(
            request.NamespaceId,
            cancellationToken
        );
        if (@namespace == null)
        {
            return Result<bool>.Failure("Errors.NamespaceNotFound");
        }

        // Check permission
        var currentUserId = _currentUserService.UserId;
        if (!currentUserId.HasValue)
        {
            return Result<bool>.Failure("Errors.UserNotAuthenticated");
        }

        var currentMembership = @namespace.Memberships.FirstOrDefault(m =>
            m.UserId == currentUserId.Value
        );
        if (
            currentMembership == null
            || !currentMembership.HasPermission(NamespacePermission.ManageMembers)
        )
        {
            return Result<bool>.Failure("Errors.NoPermissionRemoveMembers");
        }

        // Find the membership to remove
        var membershipToRemove = @namespace.Memberships.FirstOrDefault(m =>
            m.Id == request.MembershipId
        );
        if (membershipToRemove == null)
        {
            return Result<bool>.Failure("Errors.MembershipNotFound");
        }

        // Cannot remove owner
        if (membershipToRemove.Role == NamespaceRole.Owner)
        {
            return Result<bool>.Failure("Errors.CannotRemoveOwner");
        }

        // Cannot remove someone with a higher role
        if (membershipToRemove.Role < currentMembership.Role)
        {
            return Result<bool>.Failure("Errors.CannotRemoveHigherRole");
        }

        @namespace.RemoveMember(membershipToRemove.UserId);

        _namespaceRepository.Update(@namespace);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
