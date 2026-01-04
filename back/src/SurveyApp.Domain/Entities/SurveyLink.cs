using SurveyApp.Domain.Common;
using SurveyApp.Domain.Enums;

namespace SurveyApp.Domain.Entities;

/// <summary>
/// Represents a custom link for accessing a survey with tracking capabilities.
/// </summary>
public class SurveyLink : Entity<Guid>
{
    private readonly List<LinkClick> _clicks = [];

    /// <summary>
    /// Gets the survey ID this link belongs to.
    /// </summary>
    public Guid SurveyId { get; private set; }

    /// <summary>
    /// Gets the unique token for this link.
    /// </summary>
    public string Token { get; private set; } = null!;

    /// <summary>
    /// Gets the type of the link.
    /// </summary>
    public SurveyLinkType Type { get; private set; }

    /// <summary>
    /// Gets the name/label for this link (for identification).
    /// </summary>
    public string? Name { get; private set; }

    /// <summary>
    /// Gets the UTM source parameter.
    /// </summary>
    public string? Source { get; private set; }

    /// <summary>
    /// Gets the UTM medium parameter.
    /// </summary>
    public string? Medium { get; private set; }

    /// <summary>
    /// Gets the UTM campaign parameter.
    /// </summary>
    public string? Campaign { get; private set; }

    /// <summary>
    /// Gets the prefill data as JSON.
    /// </summary>
    public string? PrefillDataJson { get; private set; }

    /// <summary>
    /// Gets whether this link is active.
    /// </summary>
    public bool IsActive { get; private set; }

    /// <summary>
    /// Gets the expiration date of this link.
    /// </summary>
    public DateTime? ExpiresAt { get; private set; }

    /// <summary>
    /// Gets the maximum number of times this link can be used.
    /// </summary>
    public int? MaxUses { get; private set; }

    /// <summary>
    /// Gets the number of times this link has been used.
    /// </summary>
    public int UsageCount { get; private set; }

    /// <summary>
    /// Gets the number of completed responses from this link.
    /// </summary>
    public int ResponseCount { get; private set; }

    /// <summary>
    /// Gets the optional password protection for this link.
    /// </summary>
    public string? Password { get; private set; }

    /// <summary>
    /// Gets the survey navigation property.
    /// </summary>
    public Survey Survey { get; private set; } = null!;

    /// <summary>
    /// Gets the clicks for this link.
    /// </summary>
    public IReadOnlyCollection<LinkClick> Clicks => _clicks.AsReadOnly();

    private SurveyLink() { }

    private SurveyLink(
        Guid id,
        Guid surveyId,
        SurveyLinkType type,
        string? name,
        string? source,
        string? medium,
        string? campaign
    )
        : base(id)
    {
        SurveyId = surveyId;
        Token = GenerateToken();
        Type = type;
        Name = name;
        Source = source;
        Medium = medium;
        Campaign = campaign;
        IsActive = true;
        UsageCount = 0;
        ResponseCount = 0;
    }

    /// <summary>
    /// Creates a new survey link.
    /// </summary>
    public static SurveyLink Create(
        Guid surveyId,
        SurveyLinkType type,
        string? name = null,
        string? source = null,
        string? medium = null,
        string? campaign = null
    )
    {
        return new SurveyLink(Guid.NewGuid(), surveyId, type, name, source, medium, campaign);
    }

    /// <summary>
    /// Updates the link name.
    /// </summary>
    public void UpdateName(string? name)
    {
        Name = name;
    }

    /// <summary>
    /// Updates the tracking parameters.
    /// </summary>
    public void UpdateTracking(string? source, string? medium, string? campaign)
    {
        Source = source;
        Medium = medium;
        Campaign = campaign;
    }

    /// <summary>
    /// Sets the prefill data.
    /// </summary>
    public void SetPrefillData(string? prefillDataJson)
    {
        PrefillDataJson = prefillDataJson;
    }

    /// <summary>
    /// Sets the expiration date.
    /// </summary>
    public void SetExpiration(DateTime? expiresAt)
    {
        ExpiresAt = expiresAt;
    }

    /// <summary>
    /// Sets the maximum number of uses.
    /// </summary>
    public void SetMaxUses(int? maxUses)
    {
        if (maxUses.HasValue && maxUses.Value <= 0)
            throw new DomainException("Domain.SurveyLink.MaxUsesPositive");

        MaxUses = maxUses;
    }

    /// <summary>
    /// Sets password protection.
    /// </summary>
    public void SetPassword(string? password)
    {
        Password = password;
    }

    /// <summary>
    /// Activates the link.
    /// </summary>
    public void Activate()
    {
        IsActive = true;
    }

    /// <summary>
    /// Deactivates the link.
    /// </summary>
    public void Deactivate()
    {
        IsActive = false;
    }

    /// <summary>
    /// Records a click/usage of this link.
    /// </summary>
    public void RecordUsage()
    {
        UsageCount++;
    }

    /// <summary>
    /// Records a completed response from this link.
    /// </summary>
    public void RecordResponse()
    {
        ResponseCount++;
    }

    /// <summary>
    /// Checks if this link is valid for use.
    /// </summary>
    public bool IsValid()
    {
        if (!IsActive)
            return false;

        if (ExpiresAt.HasValue && DateTime.UtcNow > ExpiresAt.Value)
            return false;

        // Unique links are single-use by definition - check ResponseCount (completed responses)
        // This ensures the link is only marked as "used" when a response is actually submitted
        if (Type == Enums.SurveyLinkType.Unique && ResponseCount >= 1)
            return false;

        // MaxUses provides optional additional limit for other link types
        if (MaxUses.HasValue && UsageCount >= MaxUses.Value)
            return false;

        return true;
    }

    /// <summary>
    /// Checks if the provided password is correct.
    /// </summary>
    public bool ValidatePassword(string? password)
    {
        if (string.IsNullOrEmpty(Password))
            return true;

        return Password == password;
    }

    /// <summary>
    /// Regenerates the token.
    /// </summary>
    public void RegenerateToken()
    {
        Token = GenerateToken();
    }

    private static string GenerateToken()
    {
        // Generate a URL-safe token
        return Convert
            .ToBase64String(Guid.NewGuid().ToByteArray())
            .Replace("+", "-")
            .Replace("/", "_")
            .Replace("=", "")
            .Substring(0, 12);
    }
}
