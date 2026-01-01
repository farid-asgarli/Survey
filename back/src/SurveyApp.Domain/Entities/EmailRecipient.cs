using SurveyApp.Domain.Common;
using SurveyApp.Domain.Enums;

namespace SurveyApp.Domain.Entities;

/// <summary>
/// Represents a recipient in an email distribution.
/// </summary>
public class EmailRecipient : Entity<Guid>
{
    /// <summary>
    /// Gets the distribution ID this recipient belongs to.
    /// </summary>
    public Guid DistributionId { get; private set; }

    /// <summary>
    /// Gets the recipient's email address.
    /// </summary>
    public string Email { get; private set; } = null!;

    /// <summary>
    /// Gets the recipient's name.
    /// </summary>
    public string? Name { get; private set; }

    /// <summary>
    /// Gets the status of this recipient.
    /// </summary>
    public RecipientStatus Status { get; private set; }

    /// <summary>
    /// Gets when the email was sent.
    /// </summary>
    public DateTime? SentAt { get; private set; }

    /// <summary>
    /// Gets when the email was delivered.
    /// </summary>
    public DateTime? DeliveredAt { get; private set; }

    /// <summary>
    /// Gets when the email was opened.
    /// </summary>
    public DateTime? OpenedAt { get; private set; }

    /// <summary>
    /// Gets when a link was clicked.
    /// </summary>
    public DateTime? ClickedAt { get; private set; }

    /// <summary>
    /// Gets the unique tracking token for this recipient.
    /// </summary>
    public string UniqueToken { get; private set; } = null!;

    /// <summary>
    /// Gets the error message if the email failed.
    /// </summary>
    public string? ErrorMessage { get; private set; }

    /// <summary>
    /// Gets the number of open events tracked.
    /// </summary>
    public int OpenCount { get; private set; }

    /// <summary>
    /// Gets the number of click events tracked.
    /// </summary>
    public int ClickCount { get; private set; }

    /// <summary>
    /// Gets the navigation property to the distribution.
    /// </summary>
    public EmailDistribution? Distribution { get; private set; }

    private EmailRecipient() { }

    private EmailRecipient(Guid distributionId, string email, string? name)
        : base(Guid.NewGuid())
    {
        DistributionId = distributionId;
        Email = email;
        Name = name;
        Status = RecipientStatus.Pending;
        UniqueToken = GenerateUniqueToken();
    }

    /// <summary>
    /// Creates a new email recipient.
    /// </summary>
    public static EmailRecipient Create(Guid distributionId, string email, string? name = null)
    {
        if (string.IsNullOrWhiteSpace(email))
            throw new DomainException("Domain.EmailRecipient.EmailEmpty");

        return new EmailRecipient(distributionId, email, name);
    }

    /// <summary>
    /// Marks the email as sent.
    /// </summary>
    public void MarkAsSent()
    {
        Status = RecipientStatus.Sent;
        SentAt = DateTime.UtcNow;
    }

    /// <summary>
    /// Marks the email as delivered.
    /// </summary>
    public void MarkAsDelivered()
    {
        Status = RecipientStatus.Delivered;
        DeliveredAt = DateTime.UtcNow;
    }

    /// <summary>
    /// Marks the email as opened.
    /// </summary>
    public void MarkAsOpened()
    {
        if (Status < RecipientStatus.Opened)
        {
            Status = RecipientStatus.Opened;
            OpenedAt = DateTime.UtcNow;
        }
        OpenCount++;
    }

    /// <summary>
    /// Marks that a link was clicked.
    /// </summary>
    public void MarkAsClicked()
    {
        if (Status < RecipientStatus.Clicked)
        {
            Status = RecipientStatus.Clicked;
            ClickedAt = DateTime.UtcNow;
        }
        ClickCount++;
    }

    /// <summary>
    /// Marks the email as bounced.
    /// </summary>
    public void MarkAsBounced(string? errorMessage = null)
    {
        Status = RecipientStatus.Bounced;
        ErrorMessage = errorMessage;
    }

    /// <summary>
    /// Marks the recipient as unsubscribed.
    /// </summary>
    public void MarkAsUnsubscribed()
    {
        Status = RecipientStatus.Unsubscribed;
    }

    /// <summary>
    /// Marks the email as failed.
    /// </summary>
    public void MarkAsFailed(string? errorMessage = null)
    {
        Status = RecipientStatus.Failed;
        ErrorMessage = errorMessage;
    }

    /// <summary>
    /// Regenerates the unique token.
    /// </summary>
    public void RegenerateToken()
    {
        UniqueToken = GenerateUniqueToken();
    }

    private static string GenerateUniqueToken()
    {
        return Convert
            .ToBase64String(Guid.NewGuid().ToByteArray())
            .Replace("/", "_")
            .Replace("+", "-")
            .Replace("=", "");
    }
}
