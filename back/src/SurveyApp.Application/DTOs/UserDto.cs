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
    public string? ProfilePictureUrl { get; set; }
    public DateTime? LastLoginAt { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}

/// <summary>
/// DTO for user profile data.
/// </summary>
public class UserProfileDto : UserDto
{
    public IReadOnlyList<UserNamespaceMembershipDto> Namespaces { get; set; } =
        Array.Empty<UserNamespaceMembershipDto>();
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
