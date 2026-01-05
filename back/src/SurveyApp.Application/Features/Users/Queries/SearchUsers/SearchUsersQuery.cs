using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.DTOs;

namespace SurveyApp.Application.Features.Users.Queries.SearchUsers;

/// <summary>
/// Query to search for users by name or email.
/// Used for autocomplete when inviting members to a workspace.
/// </summary>
public record SearchUsersQuery(
    string Query,
    Guid? ExcludeFromNamespaceId = null,
    int MaxResults = 10
) : IRequest<Result<IReadOnlyList<UserSearchResultDto>>>;
