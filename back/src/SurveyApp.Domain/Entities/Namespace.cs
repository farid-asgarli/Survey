using SurveyApp.Domain.Common;
using SurveyApp.Domain.Enums;
using SurveyApp.Domain.Events;
using SurveyApp.Domain.ValueObjects;

namespace SurveyApp.Domain.Entities;

/// <summary>
/// Represents a namespace (tenant) in the multi-tenant system.
/// </summary>
public class Namespace : AggregateRoot<Guid>
{
    private readonly List<NamespaceMembership> _memberships = [];
    private readonly List<Survey> _surveys = [];

    /// <summary>
    /// Gets the name of the namespace.
    /// </summary>
    public string Name { get; private set; } = null!;

    /// <summary>
    /// Gets the unique slug for the namespace.
    /// </summary>
    public string Slug { get; private set; } = null!;

    /// <summary>
    /// Gets the subscription tier for the namespace.
    /// </summary>
    public SubscriptionTier SubscriptionTier { get; private set; }

    /// <summary>
    /// Gets whether the namespace is active.
    /// </summary>
    public bool IsActive { get; private set; }

    /// <summary>
    /// Gets the maximum number of users allowed in the namespace.
    /// </summary>
    public int MaxUsers { get; private set; }

    /// <summary>
    /// Gets the maximum number of surveys allowed in the namespace.
    /// </summary>
    public int MaxSurveys { get; private set; }

    /// <summary>
    /// Gets the description of the namespace.
    /// </summary>
    public string? Description { get; private set; }

    /// <summary>
    /// Gets the logo URL of the namespace.
    /// </summary>
    public string? LogoUrl { get; private set; }

    /// <summary>
    /// Gets the memberships in this namespace.
    /// </summary>
    public IReadOnlyCollection<NamespaceMembership> Memberships => _memberships.AsReadOnly();

    /// <summary>
    /// Gets the surveys in this namespace.
    /// </summary>
    public IReadOnlyCollection<Survey> Surveys => _surveys.AsReadOnly();

    /// <summary>
    /// Checks if the namespace can create more surveys based on subscription limits.
    /// </summary>
    public bool CanCreateSurvey()
    {
        return _surveys.Count < MaxSurveys;
    }

    private Namespace() { }

    private Namespace(Guid id, string name, NamespaceSlug slug, SubscriptionTier subscriptionTier)
        : base(id)
    {
        Name = name;
        Slug = slug.Value;
        SubscriptionTier = subscriptionTier;
        IsActive = true;
        SetLimitsForTier(subscriptionTier);
    }

    /// <summary>
    /// Creates a new namespace.
    /// </summary>
    public static Namespace Create(
        string name,
        string slug,
        SubscriptionTier subscriptionTier = SubscriptionTier.Free
    )
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new DomainException("Domain.Namespace.NamespaceNameRequired");

        var namespaceSlug = NamespaceSlug.Create(slug);
        var ns = new Namespace(Guid.NewGuid(), name, namespaceSlug, subscriptionTier);

        ns.AddDomainEvent(new NamespaceCreatedEvent(ns.Id, ns.Name, ns.Slug));

        return ns;
    }

    /// <summary>
    /// Creates the default namespace.
    /// </summary>
    public static Namespace CreateDefault()
    {
        return Create("Default", "default", SubscriptionTier.Enterprise);
    }

    /// <summary>
    /// Updates the namespace name.
    /// </summary>
    public void UpdateName(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new DomainException("Domain.Namespace.NamespaceNameRequired");

        Name = name;
    }

    /// <summary>
    /// Updates the namespace description.
    /// </summary>
    public void UpdateDescription(string? description)
    {
        Description = description;
    }

    /// <summary>
    /// Updates the namespace logo URL.
    /// </summary>
    public void UpdateLogoUrl(string? logoUrl)
    {
        LogoUrl = logoUrl;
    }

    /// <summary>
    /// Updates the namespace details.
    /// </summary>
    public void UpdateDetails(string name, string? description, string? logoUrl)
    {
        UpdateName(name);
        UpdateDescription(description);
        UpdateLogoUrl(logoUrl);
    }

    /// <summary>
    /// Adds a member to the namespace.
    /// </summary>
    public NamespaceMembership AddMember(User user, NamespaceRole role)
    {
        return AddUser(user, role);
    }

    /// <summary>
    /// Upgrades the subscription tier.
    /// </summary>
    public void UpgradeSubscription(SubscriptionTier newTier)
    {
        if (newTier <= SubscriptionTier)
            throw new DomainException("Domain.Namespace.CannotDowngradeSubscription");

        SubscriptionTier = newTier;
        SetLimitsForTier(newTier);
    }

    /// <summary>
    /// Changes the subscription tier.
    /// </summary>
    public void ChangeSubscription(SubscriptionTier newTier)
    {
        SubscriptionTier = newTier;
        SetLimitsForTier(newTier);
    }

    /// <summary>
    /// Adds a user to the namespace.
    /// </summary>
    public NamespaceMembership AddUser(User user, NamespaceRole role, Guid? invitedBy = null)
    {
        if (!IsActive)
            throw new DomainException("Domain.Namespace.CannotAddUsersInactive");

        if (_memberships.Count >= MaxUsers)
            throw new DomainException("Domain.Namespace.MaxUsersReached", MaxUsers);

        if (_memberships.Any(m => m.UserId == user.Id))
            throw new DomainException("Domain.Namespace.UserAlreadyMember");

        var membership = NamespaceMembership.Create(user.Id, Id, role, invitedBy);
        _memberships.Add(membership);

        AddDomainEvent(new UserInvitedToNamespaceEvent(Id, user.Id, role, invitedBy));

        return membership;
    }

    /// <summary>
    /// Removes a member from the namespace.
    /// </summary>
    public void RemoveMember(Guid userId)
    {
        var membership = _memberships.FirstOrDefault(m => m.UserId == userId);
        if (membership == null)
            throw new DomainException("Domain.Namespace.UserNotMember");

        if (
            membership.Role == NamespaceRole.Owner
            && _memberships.Count(m => m.Role == NamespaceRole.Owner) == 1
        )
            throw new DomainException("Domain.Namespace.CannotRemoveLastOwner");

        _memberships.Remove(membership);
    }

    /// <summary>
    /// Deactivates the namespace.
    /// </summary>
    public void Deactivate()
    {
        IsActive = false;
    }

    /// <summary>
    /// Activates the namespace.
    /// </summary>
    public void Activate()
    {
        IsActive = true;
    }

    /// <summary>
    /// Checks if the namespace can add more surveys.
    /// </summary>
    public bool CanAddSurvey()
    {
        return IsActive && _surveys.Count(s => !s.IsDeleted) < MaxSurveys;
    }

    private void SetLimitsForTier(SubscriptionTier tier)
    {
        (MaxUsers, MaxSurveys) = tier switch
        {
            SubscriptionTier.Free => (5, 10),
            SubscriptionTier.Pro => (50, 100),
            SubscriptionTier.Enterprise => (int.MaxValue, int.MaxValue),
            _ => (5, 10),
        };
    }
}
