using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Domain.Entities;
using SurveyApp.Domain.Interfaces;
using SurveyApp.Domain.ValueObjects;

namespace SurveyApp.Application.Features.Namespaces.Commands.InviteUser;

public class InviteUserToNamespaceCommandHandler(
    INamespaceRepository namespaceRepository,
    IUserRepository userRepository,
    INotificationRepository notificationRepository,
    IUnitOfWork unitOfWork,
    ICurrentUserService currentUserService
) : IRequestHandler<InviteUserToNamespaceCommand, Result<InviteUserResult>>
{
    private readonly INamespaceRepository _namespaceRepository = namespaceRepository;
    private readonly IUserRepository _userRepository = userRepository;
    private readonly INotificationRepository _notificationRepository = notificationRepository;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;
    private readonly ICurrentUserService _currentUserService = currentUserService;

    public async Task<Result<InviteUserResult>> Handle(
        InviteUserToNamespaceCommand request,
        CancellationToken cancellationToken
    )
    {
        var @namespace = await _namespaceRepository.GetByIdAsync(
            request.NamespaceId,
            cancellationToken
        );
        if (@namespace == null)
        {
            return Result<InviteUserResult>.NotFound("Errors.NamespaceNotFound");
        }

        // Check permission
        var currentUserId = _currentUserService.UserId;
        if (!currentUserId.HasValue)
        {
            return Result<InviteUserResult>.Unauthorized("Errors.UserNotAuthenticated");
        }

        var currentMembership = @namespace.Memberships.FirstOrDefault(m =>
            m.UserId == currentUserId.Value
        );
        if (
            currentMembership == null
            || !currentMembership.HasPermission(NamespacePermission.ManageMembers)
        )
        {
            return Result<InviteUserResult>.Forbidden("Errors.NoPermissionInviteUsers");
        }

        // Cannot assign a role higher than your own
        if (request.Role < currentMembership.Role)
        {
            return Result<InviteUserResult>.Failure("Errors.CannotAssignHigherRole");
        }

        // Validate email
        if (!Email.TryCreate(request.Email, out var email) || email == null)
        {
            return Result<InviteUserResult>.Failure("Errors.InvalidEmailAddress");
        }

        // Check if user exists
        var existingUser = await _userRepository.GetByEmailAsync(email, cancellationToken);
        bool isNewUser = existingUser == null;
        string? inviteToken = null;

        if (existingUser != null)
        {
            // Check if already a member
            var existingMembership = @namespace.Memberships.FirstOrDefault(m =>
                m.UserId == existingUser.Id
            );
            if (existingMembership != null)
            {
                return Result<InviteUserResult>.Failure("Errors.UserAlreadyMember");
            }

            // Add existing user
            @namespace.AddMember(existingUser, request.Role);

            // Get inviter's name for the notification
            var inviter = await _userRepository.GetByIdAsync(
                currentUserId.Value,
                cancellationToken
            );
            var inviterName =
                inviter != null ? $"{inviter.FirstName} {inviter.LastName}".Trim() : "Someone";
            if (string.IsNullOrEmpty(inviterName))
                inviterName = inviter?.Email ?? "Someone";

            // Create notification for the invited user
            var notification = Notification.CreateWorkspaceInvitation(
                existingUser.Id,
                @namespace.Name,
                request.Role.ToString(),
                inviterName,
                @namespace.Id
            );
            await _notificationRepository.AddAsync(notification, cancellationToken);
        }
        else
        {
            // Generate invite token for new user
            inviteToken = Guid.NewGuid().ToString("N");
            // Store invite in a separate table or use a different approach
            // For now, we'll create a placeholder user that will be updated on registration
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var membership = @namespace.Memberships.LastOrDefault();

        return Result<InviteUserResult>.Success(
            new InviteUserResult
            {
                MembershipId = membership?.Id ?? Guid.Empty,
                Email = request.Email,
                Role = request.Role,
                IsNewUser = isNewUser,
                InviteToken = inviteToken,
            }
        );
    }
}
