using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Domain.Entities;
using SurveyApp.Domain.Enums;
using SurveyApp.Domain.Interfaces;

namespace SurveyApp.Application.Features.Namespaces.Commands.UpdateMemberRole;

/// <summary>
/// Handler for updating a member's role in a namespace.
/// </summary>
public class UpdateMemberRoleCommandHandler(
    INamespaceRepository namespaceRepository,
    IUnitOfWork unitOfWork,
    ICurrentUserService currentUserService
) : IRequestHandler<UpdateMemberRoleCommand, Result<UpdateMemberRoleResult>>
{
    private readonly INamespaceRepository _namespaceRepository = namespaceRepository;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;
    private readonly ICurrentUserService _currentUserService = currentUserService;

    public async Task<Result<UpdateMemberRoleResult>> Handle(
        UpdateMemberRoleCommand request,
        CancellationToken cancellationToken
    )
    {
        // Get the namespace
        var @namespace = await _namespaceRepository.GetByIdAsync(
            request.NamespaceId,
            cancellationToken
        );
        if (@namespace == null)
        {
            return Result<UpdateMemberRoleResult>.NotFound("Errors.NamespaceNotFound");
        }

        // Verify current user is authenticated
        var currentUserId = _currentUserService.UserId;
        if (!currentUserId.HasValue)
        {
            return Result<UpdateMemberRoleResult>.Unauthorized("Errors.UserNotAuthenticated");
        }

        // Get current user's membership to check permissions
        var currentMembership = @namespace.Memberships.FirstOrDefault(m =>
            m.UserId == currentUserId.Value
        );
        if (
            currentMembership == null
            || !currentMembership.HasPermission(NamespacePermission.ManageMembers)
        )
        {
            return Result<UpdateMemberRoleResult>.Forbidden("Errors.NoPermissionUpdateMemberRole");
        }

        // Find the membership to update
        var membershipToUpdate = @namespace.Memberships.FirstOrDefault(m =>
            m.Id == request.MembershipId
        );
        if (membershipToUpdate == null)
        {
            return Result<UpdateMemberRoleResult>.NotFound("Errors.MembershipNotFound");
        }

        // Cannot change the role of an owner (ownership must be transferred separately)
        if (membershipToUpdate.Role == NamespaceRole.Owner)
        {
            return Result<UpdateMemberRoleResult>.Failure("Errors.CannotChangeOwnerRole");
        }

        // Cannot assign owner role through this command (ownership transfer requires separate flow)
        if (request.Role == NamespaceRole.Owner)
        {
            return Result<UpdateMemberRoleResult>.Failure("Errors.CannotAssignOwnerRole");
        }

        // Cannot change the role of someone with a higher role than yourself
        if (membershipToUpdate.Role < currentMembership.Role)
        {
            return Result<UpdateMemberRoleResult>.Failure("Errors.CannotChangeHigherRoleMember");
        }

        // Cannot assign a role higher than your own (except Owner who can assign any role)
        if (currentMembership.Role != NamespaceRole.Owner && request.Role < currentMembership.Role)
        {
            return Result<UpdateMemberRoleResult>.Failure("Errors.CannotAssignHigherRole");
        }

        // Cannot change your own role (prevents accidental self-demotion)
        if (membershipToUpdate.UserId == currentUserId.Value)
        {
            return Result<UpdateMemberRoleResult>.Failure("Errors.CannotChangeOwnRole");
        }

        // Update the role
        membershipToUpdate.UpdateRole(request.Role);

        _namespaceRepository.Update(@namespace);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<UpdateMemberRoleResult>.Success(
            new UpdateMemberRoleResult
            {
                MembershipId = membershipToUpdate.Id,
                UserId = membershipToUpdate.UserId,
                Role = request.Role,
            }
        );
    }
}
