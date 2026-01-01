using SurveyApp.Domain.Enums;

namespace SurveyApp.Application.DTOs;

/// <summary>
/// DTO for namespace data.
/// </summary>
public class NamespaceDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = null!;
    public string Slug { get; set; } = null!;
    public SubscriptionTier SubscriptionTier { get; set; }
    public bool IsActive { get; set; }
    public int MaxUsers { get; set; }
    public int MaxSurveys { get; set; }
    public string? Description { get; set; }
    public string? LogoUrl { get; set; }
    public int MemberCount { get; set; }
    public int SurveyCount { get; set; }
    public Guid OwnerId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

/// <summary>
/// DTO for namespace member data.
/// </summary>
public class NamespaceMemberDto
{
    public Guid MembershipId { get; set; }
    public Guid UserId { get; set; }
    public string Email { get; set; } = null!;
    public string FirstName { get; set; } = null!;
    public string LastName { get; set; } = null!;
    public string FullName { get; set; } = null!;
    public string? AvatarUrl { get; set; }
    public NamespaceRole Role { get; set; }
    public DateTime JoinedAt { get; set; }
    public string? ProfilePictureUrl { get; set; }
}

/// <summary>
/// DTO for namespace details with members.
/// </summary>
public class NamespaceDetailsDto : NamespaceDto
{
    public IReadOnlyList<NamespaceMemberDto> Members { get; set; } = [];
}
