using SurveyApp.Application.DTOs;

namespace SurveyApp.Application.Common.Interfaces;

/// <summary>
/// Interface for email distribution operations.
/// </summary>
public interface IEmailDistributionService
{
    /// <summary>
    /// Sends all pending emails for a distribution.
    /// </summary>
    /// <param name="distributionId">The distribution ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    Task SendDistributionAsync(Guid distributionId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends a single email to a recipient.
    /// </summary>
    /// <param name="recipientId">The recipient ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    Task SendToRecipientAsync(Guid recipientId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends a test email for a template.
    /// </summary>
    /// <param name="templateId">The template ID.</param>
    /// <param name="testEmail">The email address to send the test to.</param>
    /// <param name="sampleData">Sample data for placeholders.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    Task SendTestEmailAsync(
        Guid templateId,
        string testEmail,
        Dictionary<string, string>? sampleData = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Sends a reminder to recipients who haven't responded.
    /// </summary>
    /// <param name="distributionId">The distribution ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    Task SendReminderAsync(Guid distributionId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Tracks an email open event.
    /// </summary>
    /// <param name="token">The tracking token.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    Task TrackOpenAsync(string token, CancellationToken cancellationToken = default);

    /// <summary>
    /// Tracks a link click event.
    /// </summary>
    /// <param name="token">The tracking token.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The survey access token for redirect.</returns>
    Task<string?> TrackClickAsync(string token, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the distribution statistics.
    /// </summary>
    /// <param name="distributionId">The distribution ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    Task<DistributionStatsDto> GetStatsAsync(
        Guid distributionId,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Retries failed deliveries for a distribution.
    /// </summary>
    /// <param name="distributionId">The distribution ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    Task RetryFailedDeliveriesAsync(
        Guid distributionId,
        CancellationToken cancellationToken = default
    );
}
