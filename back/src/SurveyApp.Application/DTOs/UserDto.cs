namespace SurveyApp.Application.DTOs;

/// <summary>
/// DTO for user data.
/// </summary>
public class UserDto
{
    public Guid Id { get; set; }
    public string Email { get; set; } = null!;
    public string FirstName { get; set; } = null!;
    public string LastName { get; set; } = null!;
    public string FullName { get; set; } = null!;
    public bool EmailConfirmed { get; set; }

    /// <summary>
    /// The ID of the user's selected avatar (e.g., "avatar-1", "avatar-32").
    /// Frontend resolves this to an actual image URL.
    /// </summary>
    public string? AvatarId { get; set; }

    public DateTime? LastLoginAt { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

/// <summary>
/// DTO for user profile data.
/// </summary>
public class UserProfileDto : UserDto
{
    public IReadOnlyList<UserNamespaceMembershipDto> Namespaces { get; set; } = [];
}

/// <summary>
/// DTO for user's namespace membership.
/// </summary>
public class UserNamespaceMembershipDto
{
    public Guid NamespaceId { get; set; }
    public string NamespaceName { get; set; } = null!;
    public string NamespaceSlug { get; set; } = null!;
    public string Role { get; set; } = null!;
    public DateTime JoinedAt { get; set; }
}

/// <summary>
/// DTO for user search results (autocomplete).
/// </summary>
public class UserSearchResultDto
{
    public Guid Id { get; set; }
    public string Email { get; set; } = null!;
    public string FirstName { get; set; } = null!;
    public string LastName { get; set; } = null!;
    public string FullName { get; set; } = null!;
    public string? AvatarId { get; set; }
}
