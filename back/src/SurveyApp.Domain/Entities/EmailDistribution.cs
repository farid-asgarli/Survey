using SurveyApp.Domain.Common;
using SurveyApp.Domain.Enums;

namespace SurveyApp.Domain.Entities;

/// <summary>
/// Represents an email distribution for a survey.
/// </summary>
public class EmailDistribution : AggregateRoot<Guid>
{
    private readonly List<EmailRecipient> _recipients = [];

    /// <summary>
    /// Gets the survey ID this distribution is for.
    /// </summary>
    public Guid SurveyId { get; private set; }

    /// <summary>
    /// Gets the namespace ID this distribution belongs to.
    /// </summary>
    public Guid NamespaceId { get; private set; }

    /// <summary>
    /// Gets the email template ID used for this distribution.
    /// </summary>
    public Guid? EmailTemplateId { get; private set; }

    /// <summary>
    /// Gets the email subject.
    /// </summary>
    public string Subject { get; private set; } = null!;

    /// <summary>
    /// Gets the email body (HTML).
    /// </summary>
    public string Body { get; private set; } = null!;

    /// <summary>
    /// Gets the sender name.
    /// </summary>
    public string? SenderName { get; private set; }

    /// <summary>
    /// Gets the sender email.
    /// </summary>
    public string? SenderEmail { get; private set; }

    /// <summary>
    /// Gets the scheduled send time.
    /// </summary>
    public DateTime? ScheduledAt { get; private set; }

    /// <summary>
    /// Gets the actual send time.
    /// </summary>
    public DateTime? SentAt { get; private set; }

    /// <summary>
    /// Gets the status of the distribution.
    /// </summary>
    public DistributionStatus Status { get; private set; }

    /// <summary>
    /// Gets the total number of recipients.
    /// </summary>
    public int TotalRecipients { get; private set; }

    /// <summary>
    /// Gets the count of sent emails.
    /// </summary>
    public int SentCount { get; private set; }

    /// <summary>
    /// Gets the count of delivered emails.
    /// </summary>
    public int DeliveredCount { get; private set; }

    /// <summary>
    /// Gets the count of opened emails.
    /// </summary>
    public int OpenedCount { get; private set; }

    /// <summary>
    /// Gets the count of clicked emails.
    /// </summary>
    public int ClickedCount { get; private set; }

    /// <summary>
    /// Gets the count of bounced emails.
    /// </summary>
    public int BouncedCount { get; private set; }

    /// <summary>
    /// Gets the count of unsubscribed recipients.
    /// </summary>
    public int UnsubscribedCount { get; private set; }

    /// <summary>
    /// Gets the email template navigation property.
    /// </summary>
    public EmailTemplate? EmailTemplate { get; private set; }

    /// <summary>
    /// Gets the survey navigation property.
    /// </summary>
    public Survey? Survey { get; private set; }

    /// <summary>
    /// Gets the recipients of this distribution.
    /// </summary>
    public IReadOnlyCollection<EmailRecipient> Recipients => _recipients.AsReadOnly();

    private EmailDistribution() { }

    private EmailDistribution(Guid surveyId, Guid namespaceId, string subject, string body)
        : base(Guid.NewGuid())
    {
        SurveyId = surveyId;
        NamespaceId = namespaceId;
        Subject = subject;
        Body = body;
        Status = DistributionStatus.Draft;
    }

    /// <summary>
    /// Creates a new email distribution.
    /// </summary>
    public static EmailDistribution Create(
        Guid surveyId,
        Guid namespaceId,
        string subject,
        string body
    )
    {
        if (string.IsNullOrWhiteSpace(subject))
            throw new ArgumentException("Subject cannot be empty.", nameof(subject));

        if (string.IsNullOrWhiteSpace(body))
            throw new ArgumentException("Body cannot be empty.", nameof(body));

        return new EmailDistribution(surveyId, namespaceId, subject, body);
    }

    /// <summary>
    /// Sets the email template for this distribution.
    /// </summary>
    public void SetTemplate(Guid? templateId)
    {
        EmailTemplateId = templateId;
    }

    /// <summary>
    /// Updates the subject.
    /// </summary>
    public void UpdateSubject(string subject)
    {
        if (string.IsNullOrWhiteSpace(subject))
            throw new ArgumentException("Subject cannot be empty.", nameof(subject));

        Subject = subject;
    }

    /// <summary>
    /// Updates the body.
    /// </summary>
    public void UpdateBody(string body)
    {
        if (string.IsNullOrWhiteSpace(body))
            throw new ArgumentException("Body cannot be empty.", nameof(body));

        Body = body;
    }

    /// <summary>
    /// Updates the sender information.
    /// </summary>
    public void UpdateSender(string? name, string? email)
    {
        SenderName = name;
        SenderEmail = email;
    }

    /// <summary>
    /// Adds a recipient to the distribution.
    /// </summary>
    public EmailRecipient AddRecipient(string email, string? name = null)
    {
        if (Status != DistributionStatus.Draft && Status != DistributionStatus.Scheduled)
            throw new InvalidOperationException(
                "Cannot add recipients after distribution has started."
            );

        var recipient = EmailRecipient.Create(Id, email, name);
        _recipients.Add(recipient);
        TotalRecipients = _recipients.Count;
        return recipient;
    }

    /// <summary>
    /// Adds multiple recipients to the distribution.
    /// </summary>
    public void AddRecipients(IEnumerable<(string Email, string? Name)> recipients)
    {
        foreach (var (email, name) in recipients)
        {
            AddRecipient(email, name);
        }
    }

    /// <summary>
    /// Removes a recipient from the distribution.
    /// </summary>
    public void RemoveRecipient(Guid recipientId)
    {
        if (Status != DistributionStatus.Draft && Status != DistributionStatus.Scheduled)
            throw new InvalidOperationException(
                "Cannot remove recipients after distribution has started."
            );

        var recipient = _recipients.FirstOrDefault(r => r.Id == recipientId);
        if (recipient != null)
        {
            _recipients.Remove(recipient);
            TotalRecipients = _recipients.Count;
        }
    }

    /// <summary>
    /// Schedules the distribution for a specific time.
    /// </summary>
    public void Schedule(DateTime scheduledAt)
    {
        if (scheduledAt <= DateTime.UtcNow)
            throw new ArgumentException(
                "Scheduled time must be in the future.",
                nameof(scheduledAt)
            );

        if (_recipients.Count == 0)
            throw new InvalidOperationException(
                "Cannot schedule a distribution without recipients."
            );

        ScheduledAt = scheduledAt;
        Status = DistributionStatus.Scheduled;
    }

    /// <summary>
    /// Starts sending the distribution.
    /// </summary>
    public void StartSending()
    {
        if (_recipients.Count == 0)
            throw new InvalidOperationException("Cannot send a distribution without recipients.");

        Status = DistributionStatus.Sending;
        SentAt = DateTime.UtcNow;
    }

    /// <summary>
    /// Marks the distribution as fully sent.
    /// </summary>
    public void MarkAsSent()
    {
        Status = DistributionStatus.Sent;
    }

    /// <summary>
    /// Marks the distribution as partially failed.
    /// </summary>
    public void MarkAsPartiallyFailed()
    {
        Status = DistributionStatus.PartiallyFailed;
    }

    /// <summary>
    /// Marks the distribution as failed.
    /// </summary>
    public void MarkAsFailed()
    {
        Status = DistributionStatus.Failed;
    }

    /// <summary>
    /// Cancels the distribution.
    /// </summary>
    public void Cancel()
    {
        if (Status == DistributionStatus.Sent || Status == DistributionStatus.Sending)
            throw new InvalidOperationException(
                "Cannot cancel a distribution that has already started sending."
            );

        Status = DistributionStatus.Cancelled;
    }

    /// <summary>
    /// Increments the sent count.
    /// </summary>
    public void IncrementSentCount()
    {
        SentCount++;
    }

    /// <summary>
    /// Increments the delivered count.
    /// </summary>
    public void IncrementDeliveredCount()
    {
        DeliveredCount++;
    }

    /// <summary>
    /// Increments the opened count.
    /// </summary>
    public void IncrementOpenedCount()
    {
        OpenedCount++;
    }

    /// <summary>
    /// Increments the clicked count.
    /// </summary>
    public void IncrementClickedCount()
    {
        ClickedCount++;
    }

    /// <summary>
    /// Increments the bounced count.
    /// </summary>
    public void IncrementBouncedCount()
    {
        BouncedCount++;
    }

    /// <summary>
    /// Increments the unsubscribed count.
    /// </summary>
    public void IncrementUnsubscribedCount()
    {
        UnsubscribedCount++;
    }

    /// <summary>
    /// Updates all tracking counters based on recipients.
    /// </summary>
    public void RefreshCounts()
    {
        SentCount = _recipients.Count(r => r.Status >= RecipientStatus.Sent);
        DeliveredCount = _recipients.Count(r =>
            r.Status >= RecipientStatus.Delivered
            && r.Status != RecipientStatus.Bounced
            && r.Status != RecipientStatus.Failed
        );
        OpenedCount = _recipients.Count(r =>
            r.Status >= RecipientStatus.Opened
            && r.Status != RecipientStatus.Bounced
            && r.Status != RecipientStatus.Failed
        );
        ClickedCount = _recipients.Count(r => r.Status == RecipientStatus.Clicked);
        BouncedCount = _recipients.Count(r => r.Status == RecipientStatus.Bounced);
        UnsubscribedCount = _recipients.Count(r => r.Status == RecipientStatus.Unsubscribed);
    }
}
