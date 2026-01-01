using AutoMapper;
using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Application.DTOs.Common;
using SurveyApp.Domain.Interfaces;

namespace SurveyApp.Application.Features.Namespaces.Queries.GetNamespaceMembers;

public class GetNamespaceMembersQueryHandler(
    INamespaceRepository namespaceRepository,
    ICurrentUserService currentUserService,
    IMapper mapper
) : IRequestHandler<GetNamespaceMembersQuery, Result<PagedResponse<NamespaceMemberDto>>>
{
    private readonly INamespaceRepository _namespaceRepository = namespaceRepository;
    private readonly ICurrentUserService _currentUserService = currentUserService;
    private readonly IMapper _mapper = mapper;

    public async Task<Result<PagedResponse<NamespaceMemberDto>>> Handle(
        GetNamespaceMembersQuery request,
        CancellationToken cancellationToken
    )
    {
        var @namespace = await _namespaceRepository.GetByIdAsync(
            request.NamespaceId,
            cancellationToken
        );
        if (@namespace == null)
        {
            return Result<PagedResponse<NamespaceMemberDto>>.NotFound("Errors.NamespaceNotFound");
        }

        // Check if user has access
        var userId = _currentUserService.UserId;
        if (!userId.HasValue)
        {
            return Result<PagedResponse<NamespaceMemberDto>>.Unauthorized(
                "Errors.UserNotAuthenticated"
            );
        }

        var membership = @namespace.Memberships.FirstOrDefault(m => m.UserId == userId.Value);
        if (membership == null)
        {
            return Result<PagedResponse<NamespaceMemberDto>>.Failure("Errors.NoAccessToNamespace");
        }

        // Get paginated members
        var (members, totalCount) = await _namespaceRepository.GetMembersPagedAsync(
            request.NamespaceId,
            request.PageNumber,
            request.PageSize,
            cancellationToken
        );

        var memberDtos = members
            .Select(m => new NamespaceMemberDto
            {
                MembershipId = m.Id,
                UserId = m.UserId,
                Email = m.User?.Email ?? string.Empty,
                FirstName = m.User?.FirstName ?? string.Empty,
                LastName = m.User?.LastName ?? string.Empty,
                AvatarUrl = m.User?.AvatarUrl,
                Role = m.Role,
                JoinedAt = m.JoinedAt,
            })
            .ToList();

        var pagedResponse = PagedResponse<NamespaceMemberDto>.Create(
            memberDtos,
            request.PageNumber,
            request.PageSize,
            totalCount
        );

        return Result<PagedResponse<NamespaceMemberDto>>.Success(pagedResponse);
    }
}
