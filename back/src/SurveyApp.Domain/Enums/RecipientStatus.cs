namespace SurveyApp.Domain.Enums;

/// <summary>
/// Represents the status of an email recipient in a distribution.
/// </summary>
public enum RecipientStatus
{
    /// <summary>
    /// Email is pending to be sent.
    /// </summary>
    Pending,

    /// <summary>
    /// Email has been sent.
    /// </summary>
    Sent,

    /// <summary>
    /// Email has been delivered.
    /// </summary>
    Delivered,

    /// <summary>
    /// Email has been opened.
    /// </summary>
    Opened,

    /// <summary>
    /// Link in the email has been clicked.
    /// </summary>
    Clicked,

    /// <summary>
    /// Email bounced.
    /// </summary>
    Bounced,

    /// <summary>
    /// Recipient unsubscribed.
    /// </summary>
    Unsubscribed,

    /// <summary>
    /// Email failed to send.
    /// </summary>
    Failed
}
