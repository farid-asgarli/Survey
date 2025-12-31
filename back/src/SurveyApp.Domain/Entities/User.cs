using SurveyApp.Domain.Common;

namespace SurveyApp.Domain.Entities;

/// <summary>
/// Represents a user in the system.
/// </summary>
public class User : AggregateRoot<Guid>
{
    private readonly List<NamespaceMembership> _memberships = [];

    /// <summary>
    /// Gets the email address of the user.
    /// </summary>
    public string Email { get; private set; } = null!;

    /// <summary>
    /// Gets the hashed password of the user.
    /// </summary>
    public string PasswordHash { get; private set; } = null!;

    /// <summary>
    /// Gets the first name of the user.
    /// </summary>
    public string FirstName { get; private set; } = null!;

    /// <summary>
    /// Gets the last name of the user.
    /// </summary>
    public string LastName { get; private set; } = null!;

    /// <summary>
    /// Gets the full name of the user.
    /// </summary>
    public string FullName => $"{FirstName} {LastName}";

    /// <summary>
    /// Gets whether the user's email has been confirmed.
    /// </summary>
    public bool EmailConfirmed { get; private set; }

    /// <summary>
    /// Gets the URL of the user's profile picture.
    /// </summary>
    public string? ProfilePictureUrl { get; private set; }

    /// <summary>
    /// Gets the avatar URL (alias for ProfilePictureUrl).
    /// </summary>
    public string? AvatarUrl => ProfilePictureUrl;

    /// <summary>
    /// Gets the date and time of the user's last login.
    /// </summary>
    public DateTime? LastLoginAt { get; private set; }

    /// <summary>
    /// Gets whether the user is active.
    /// </summary>
    public bool IsActive { get; private set; }

    /// <summary>
    /// Gets the namespace memberships of the user.
    /// </summary>
    public IReadOnlyCollection<NamespaceMembership> Memberships => _memberships.AsReadOnly();

    private User() { }

    private User(Guid id, string email, string passwordHash, string firstName, string lastName)
        : base(id)
    {
        Email = email;
        PasswordHash = passwordHash;
        FirstName = firstName;
        LastName = lastName;
        IsActive = true;
        EmailConfirmed = false;
    }

    /// <summary>
    /// Creates a new user.
    /// </summary>
    public static User Create(string email, string passwordHash, string firstName, string lastName)
    {
        var emailVO = ValueObjects.Email.Create(email);

        if (string.IsNullOrWhiteSpace(firstName))
            throw new DomainException("Domain.User.FirstNameRequired");

        if (string.IsNullOrWhiteSpace(lastName))
            throw new DomainException("Domain.User.LastNameRequired");

        return new User(
            Guid.NewGuid(),
            emailVO.Value,
            passwordHash,
            firstName.Trim(),
            lastName.Trim()
        );
    }

    /// <summary>
    /// Updates the user's email.
    /// </summary>
    public void UpdateEmail(string email)
    {
        var emailVO = ValueObjects.Email.Create(email);
        Email = emailVO.Value;
        EmailConfirmed = false; // Require re-confirmation
    }

    /// <summary>
    /// Updates the user's password hash.
    /// </summary>
    public void UpdatePasswordHash(string passwordHash)
    {
        if (string.IsNullOrWhiteSpace(passwordHash))
            throw new ArgumentException("Password hash cannot be empty.", nameof(passwordHash));

        PasswordHash = passwordHash;
    }

    /// <summary>
    /// Updates the user's name.
    /// </summary>
    public void UpdateName(string firstName, string lastName)
    {
        if (string.IsNullOrWhiteSpace(firstName))
            throw new DomainException("Domain.User.FirstNameRequired");

        if (string.IsNullOrWhiteSpace(lastName))
            throw new DomainException("Domain.User.LastNameRequired");

        FirstName = firstName.Trim();
        LastName = lastName.Trim();
    }

    /// <summary>
    /// Updates the user's profile (name and avatar).
    /// </summary>
    public void UpdateProfile(string firstName, string lastName, string? avatarUrl = null)
    {
        UpdateName(firstName, lastName);
        UpdateProfilePicture(avatarUrl);
    }

    /// <summary>
    /// Updates the user's profile picture URL.
    /// </summary>
    public void UpdateProfilePicture(string? profilePictureUrl)
    {
        ProfilePictureUrl = profilePictureUrl;
    }

    /// <summary>
    /// Confirms the user's email.
    /// </summary>
    public void ConfirmEmail()
    {
        EmailConfirmed = true;
    }

    /// <summary>
    /// Records a login.
    /// </summary>
    public void RecordLogin()
    {
        LastLoginAt = DateTime.UtcNow;
    }

    /// <summary>
    /// Deactivates the user.
    /// </summary>
    public void Deactivate()
    {
        IsActive = false;
    }

    /// <summary>
    /// Activates the user.
    /// </summary>
    public void Activate()
    {
        IsActive = true;
    }
}
