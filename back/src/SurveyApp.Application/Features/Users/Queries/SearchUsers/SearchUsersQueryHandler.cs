using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Domain.Interfaces;

namespace SurveyApp.Application.Features.Users.Queries.SearchUsers;

public class SearchUsersQueryHandler(
    IUserRepository userRepository,
    ICurrentUserService currentUserService
) : IRequestHandler<SearchUsersQuery, Result<IReadOnlyList<UserSearchResultDto>>>
{
    private readonly IUserRepository _userRepository = userRepository;
    private readonly ICurrentUserService _currentUserService = currentUserService;

    public async Task<Result<IReadOnlyList<UserSearchResultDto>>> Handle(
        SearchUsersQuery request,
        CancellationToken cancellationToken
    )
    {
        // Require authentication
        var currentUserId = _currentUserService.UserId;
        if (!currentUserId.HasValue)
        {
            return Result<IReadOnlyList<UserSearchResultDto>>.Unauthorized(
                "Errors.UserNotAuthenticated"
            );
        }

        // Validate query length
        if (string.IsNullOrWhiteSpace(request.Query) || request.Query.Trim().Length < 2)
        {
            return Result<IReadOnlyList<UserSearchResultDto>>.Success(
                Array.Empty<UserSearchResultDto>()
            );
        }

        var users = request.ExcludeFromNamespaceId.HasValue
            ? await _userRepository.SearchForNamespaceInviteAsync(
                request.Query,
                request.ExcludeFromNamespaceId.Value,
                request.MaxResults,
                cancellationToken
            )
            : await _userRepository.SearchAsync(
                request.Query,
                request.MaxResults,
                cancellationToken
            );

        var results = users
            .Select(u => new UserSearchResultDto
            {
                Id = u.Id,
                Email = u.Email,
                FirstName = u.FirstName,
                LastName = u.LastName,
                FullName = $"{u.FirstName} {u.LastName}".Trim(),
                AvatarId = u.AvatarId,
            })
            .ToList();

        return Result<IReadOnlyList<UserSearchResultDto>>.Success(results);
    }
}
