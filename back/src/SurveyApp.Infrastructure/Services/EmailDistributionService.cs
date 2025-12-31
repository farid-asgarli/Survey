using Microsoft.Extensions.Localization;
using Microsoft.Extensions.Logging;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Domain.Enums;
using SurveyApp.Domain.Interfaces;

namespace SurveyApp.Infrastructure.Services;

/// <summary>
/// Service for handling email distribution operations.
/// </summary>
public class EmailDistributionService(
    IEmailDistributionRepository distributionRepository,
    IEmailTemplateRepository templateRepository,
    ISurveyRepository surveyRepository,
    INamespaceRepository namespaceRepository,
    IUnitOfWork unitOfWork,
    IStringLocalizer<EmailDistributionService> localizer,
    ILogger<EmailDistributionService> logger
) : IEmailDistributionService
{
    private readonly IEmailDistributionRepository _distributionRepository = distributionRepository;
    private readonly IEmailTemplateRepository _templateRepository = templateRepository;
    private readonly ISurveyRepository _surveyRepository = surveyRepository;
    private readonly INamespaceRepository _namespaceRepository = namespaceRepository;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;
    private readonly IStringLocalizer<EmailDistributionService> _localizer = localizer;
    private readonly ILogger<EmailDistributionService> _logger = logger;

    public async Task SendDistributionAsync(
        Guid distributionId,
        CancellationToken cancellationToken = default
    )
    {
        var distribution = await _distributionRepository.GetByIdWithRecipientsAsync(
            distributionId,
            cancellationToken
        );

        if (distribution == null)
        {
            _logger.LogWarning("Distribution {DistributionId} not found", distributionId);
            return;
        }

        var survey = await _surveyRepository.GetByIdAsync(distribution.SurveyId, cancellationToken);
        var ns = await _namespaceRepository.GetByIdAsync(
            distribution.NamespaceId,
            cancellationToken
        );

        // Get template values for placeholders
        var baseValues = BuildPlaceholderValues(
            survey?.Title ?? "Survey",
            survey?.Description,
            survey?.AccessToken,
            distribution.SenderName ?? ns?.Name ?? "Survey Team",
            ns?.Name ?? "Organization"
        );

        var failedCount = 0;
        var sentCount = 0;

        foreach (var recipient in distribution.Recipients)
        {
            if (recipient.Status != RecipientStatus.Pending)
            {
                continue;
            }

            try
            {
                // Build personalized values
                var values = new Dictionary<string, string>(baseValues)
                {
                    ["{{respondent.name}}"] = recipient.Name ?? "there",
                    ["{{respondent.email}}"] = recipient.Email,
                    ["{{survey.link}}"] = BuildSurveyLink(
                        survey?.AccessToken,
                        recipient.UniqueToken
                    ),
                    ["{{unsubscribe.link}}"] = BuildUnsubscribeLink(recipient.UniqueToken),
                };

                // Render email content
                var subject = RenderTemplate(distribution.Subject, values);
                var body = RenderTemplate(distribution.Body, values);

                // Add tracking pixel to body
                body = AddTrackingPixel(body, recipient.UniqueToken);

                // Send the email
                await SendEmailAsync(recipient.Email, subject, body, cancellationToken);

                recipient.MarkAsSent();
                sentCount++;
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Failed to send email to {Email} for distribution {DistributionId}",
                    recipient.Email,
                    distributionId
                );
                recipient.MarkAsFailed(ex.Message);
                failedCount++;
            }

            _distributionRepository.UpdateRecipient(recipient);
        }

        // Update distribution status
        distribution.RefreshCounts();

        if (failedCount == distribution.TotalRecipients)
        {
            distribution.MarkAsFailed();
        }
        else if (failedCount > 0)
        {
            distribution.MarkAsPartiallyFailed();
        }
        else
        {
            distribution.MarkAsSent();
        }

        _distributionRepository.Update(distribution);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Distribution {DistributionId} completed: {SentCount} sent, {FailedCount} failed",
            distributionId,
            sentCount,
            failedCount
        );
    }

    public async Task SendToRecipientAsync(
        Guid recipientId,
        CancellationToken cancellationToken = default
    )
    {
        // Implementation for sending to a single recipient
        _logger.LogInformation("Sending email to recipient {RecipientId}", recipientId);
        await Task.CompletedTask;
    }

    public async Task SendTestEmailAsync(
        Guid templateId,
        string testEmail,
        Dictionary<string, string>? sampleData = null,
        CancellationToken cancellationToken = default
    )
    {
        var template = await _templateRepository.GetByIdAsync(templateId, cancellationToken);
        if (template == null)
        {
            throw new InvalidOperationException(
                "Infrastructure.EmailDistribution.TemplateNotFound"
            );
        }

        var values = sampleData ?? BuildSamplePlaceholderValues();
        var (subject, htmlBody, _) = template.Render(values);

        await SendEmailAsync(testEmail, subject, htmlBody, cancellationToken);

        _logger.LogInformation(
            "Test email sent to {Email} using template {TemplateId}",
            testEmail,
            templateId
        );
    }

    public async Task SendReminderAsync(
        Guid distributionId,
        CancellationToken cancellationToken = default
    )
    {
        var distribution = await _distributionRepository.GetByIdWithRecipientsAsync(
            distributionId,
            cancellationToken
        );

        if (distribution == null)
        {
            return;
        }

        // Find recipients who haven't responded yet (only opened or less)
        var pendingRecipients = distribution
            .Recipients.Where(r => r.Status <= RecipientStatus.Opened)
            .ToList();

        _logger.LogInformation(
            "Sending reminders for distribution {DistributionId} to {Count} recipients",
            distributionId,
            pendingRecipients.Count
        );

        foreach (var recipient in pendingRecipients)
        {
            try
            {
                var reminderSubject = _localizer[
                    "Infrastructure.EmailDistribution.ReminderPrefix",
                    distribution.Subject
                ].Value;
                await SendEmailAsync(
                    recipient.Email,
                    reminderSubject,
                    distribution.Body,
                    cancellationToken
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send reminder to {Email}", recipient.Email);
            }
        }
    }

    public async Task TrackOpenAsync(string token, CancellationToken cancellationToken = default)
    {
        var recipient = await _distributionRepository.GetRecipientByTokenAsync(
            token,
            cancellationToken
        );
        if (recipient == null)
        {
            return;
        }

        recipient.MarkAsOpened();
        _distributionRepository.UpdateRecipient(recipient);

        var distribution = await _distributionRepository.GetByIdAsync(
            recipient.DistributionId,
            cancellationToken
        );

        if (distribution != null)
        {
            distribution.RefreshCounts();
            _distributionRepository.Update(distribution);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task<string?> TrackClickAsync(
        string token,
        CancellationToken cancellationToken = default
    )
    {
        var recipient = await _distributionRepository.GetRecipientByTokenAsync(
            token,
            cancellationToken
        );
        if (recipient == null)
        {
            return null;
        }

        recipient.MarkAsClicked();
        _distributionRepository.UpdateRecipient(recipient);

        var distribution = await _distributionRepository.GetByIdAsync(
            recipient.DistributionId,
            cancellationToken
        );

        if (distribution != null)
        {
            distribution.RefreshCounts();
            _distributionRepository.Update(distribution);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Get survey access token
        if (distribution != null)
        {
            var survey = await _surveyRepository.GetByIdAsync(
                distribution.SurveyId,
                cancellationToken
            );
            return survey?.AccessToken;
        }

        return null;
    }

    public async Task<DistributionStatsDto> GetStatsAsync(
        Guid distributionId,
        CancellationToken cancellationToken = default
    )
    {
        var distribution = await _distributionRepository.GetByIdAsync(
            distributionId,
            cancellationToken
        );
        if (distribution == null)
        {
            throw new InvalidOperationException(
                "Infrastructure.EmailDistribution.DistributionNotFound"
            );
        }

        return new DistributionStatsDto
        {
            TotalRecipients = distribution.TotalRecipients,
            SentCount = distribution.SentCount,
            DeliveredCount = distribution.DeliveredCount,
            OpenedCount = distribution.OpenedCount,
            ClickedCount = distribution.ClickedCount,
            BouncedCount = distribution.BouncedCount,
            UnsubscribedCount = distribution.UnsubscribedCount,
        };
    }

    public async Task RetryFailedDeliveriesAsync(
        Guid distributionId,
        CancellationToken cancellationToken = default
    )
    {
        var distribution = await _distributionRepository.GetByIdWithRecipientsAsync(
            distributionId,
            cancellationToken
        );

        if (distribution == null)
        {
            return;
        }

        var failedRecipients = distribution
            .Recipients.Where(r => r.Status == RecipientStatus.Failed)
            .ToList();

        _logger.LogInformation(
            "Retrying {Count} failed deliveries for distribution {DistributionId}",
            failedRecipients.Count,
            distributionId
        );

        foreach (var recipient in failedRecipients)
        {
            try
            {
                // Reset status to pending
                recipient.RegenerateToken();
                _distributionRepository.UpdateRecipient(recipient);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to reset recipient {RecipientId}", recipient.Id);
            }
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Re-send
        await SendDistributionAsync(distributionId, cancellationToken);
    }

    private static Dictionary<string, string> BuildPlaceholderValues(
        string surveyTitle,
        string? surveyDescription,
        string? accessToken,
        string senderName,
        string namespaceName
    )
    {
        return new Dictionary<string, string>
        {
            ["{{survey.title}}"] = surveyTitle,
            ["{{survey.description}}"] = surveyDescription ?? "",
            ["{{survey.deadline}}"] = "",
            ["{{sender.name}}"] = senderName,
            ["{{namespace.name}}"] = namespaceName,
        };
    }

    private Dictionary<string, string> BuildSamplePlaceholderValues()
    {
        return new Dictionary<string, string>
        {
            ["{{respondent.name}}"] = _localizer["Sample.RespondentName"],
            ["{{respondent.email}}"] = "john.doe@example.com",
            ["{{survey.title}}"] = _localizer["Sample.SurveyTitle"],
            ["{{survey.description}}"] = _localizer["Sample.SurveyDescription"],
            ["{{survey.link}}"] = "https://example.com/survey/sample",
            ["{{survey.deadline}}"] = DateTime.UtcNow.AddDays(7).ToString("MMMM d, yyyy"),
            ["{{sender.name}}"] = _localizer["Sample.SenderName"],
            ["{{namespace.name}}"] = _localizer["Sample.OrganizationName"],
            ["{{unsubscribe.link}}"] = "https://example.com/unsubscribe",
        };
    }

    private static string BuildSurveyLink(string? accessToken, string recipientToken)
    {
        // Build the survey link with tracking
        return $"/api/track/click/{recipientToken}";
    }

    private static string BuildUnsubscribeLink(string recipientToken)
    {
        return $"/api/unsubscribe/{recipientToken}";
    }

    private static string RenderTemplate(string template, Dictionary<string, string> values)
    {
        var result = template;
        foreach (var (key, value) in values)
        {
            result = result.Replace(key, value);
        }
        return result;
    }

    private static string AddTrackingPixel(string htmlBody, string recipientToken)
    {
        var trackingPixel =
            $"<img src=\"/api/track/open/{recipientToken}\" width=\"1\" height=\"1\" style=\"display:none\" alt=\"\" />";

        // Try to insert before closing body tag
        if (htmlBody.Contains("</body>", StringComparison.OrdinalIgnoreCase))
        {
            return htmlBody.Replace(
                "</body>",
                $"{trackingPixel}</body>",
                StringComparison.OrdinalIgnoreCase
            );
        }

        // Otherwise, append at the end
        return htmlBody + trackingPixel;
    }

    private Task SendEmailAsync(
        string to,
        string subject,
        string body,
        CancellationToken cancellationToken
    )
    {
        // TODO: Implement actual email sending using MailKit, SendGrid, etc.
        _logger.LogInformation("Sending email to {To}: {Subject}", to, subject);
        return Task.CompletedTask;
    }
}
