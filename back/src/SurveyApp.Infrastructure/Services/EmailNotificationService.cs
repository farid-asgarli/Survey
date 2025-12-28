using Microsoft.Extensions.Logging;
using SurveyApp.Application.Services;

namespace SurveyApp.Infrastructure.Services;

public class EmailNotificationService(ILogger<EmailNotificationService> logger)
    : INotificationService
{
    private readonly ILogger<EmailNotificationService> _logger = logger;

    public Task SendEmailAsync(
        string to,
        string subject,
        string body,
        bool isHtml = true,
        CancellationToken cancellationToken = default
    )
    {
        // TODO: Implement actual email sending using SendGrid, SMTP, etc.
        _logger.LogInformation("Sending email to {To}: {Subject}", to, subject);
        return Task.CompletedTask;
    }

    public Task SendEmailAsync(
        IEnumerable<string> to,
        string subject,
        string body,
        bool isHtml = true,
        CancellationToken cancellationToken = default
    )
    {
        _logger.LogInformation(
            "Sending email to {Recipients}: {Subject}",
            string.Join(", ", to),
            subject
        );
        return Task.CompletedTask;
    }

    public Task SendSurveyInvitationAsync(
        string to,
        SurveyInvitationContext context,
        CancellationToken cancellationToken = default
    )
    {
        var subject = $"You're invited to take a survey: {context.SurveyTitle}";
        var body = BuildSurveyInvitationEmail(context);
        return SendEmailAsync(to, subject, body, true, cancellationToken);
    }

    public Task SendNamespaceInvitationAsync(
        string to,
        NamespaceInvitationContext context,
        CancellationToken cancellationToken = default
    )
    {
        var subject = $"You've been invited to join {context.NamespaceName}";
        var body = BuildNamespaceInvitationEmail(context);
        return SendEmailAsync(to, subject, body, true, cancellationToken);
    }

    public Task SendSurveyCompletionNotificationAsync(
        string to,
        SurveyCompletionContext context,
        CancellationToken cancellationToken = default
    )
    {
        var subject = $"New response received for {context.SurveyTitle}";
        var body = BuildSurveyCompletionEmail(context);
        return SendEmailAsync(to, subject, body, true, cancellationToken);
    }

    private static string BuildSurveyInvitationEmail(SurveyInvitationContext context)
    {
        return $@"
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .button {{ display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px; }}
        .footer {{ margin-top: 30px; font-size: 12px; color: #666; }}
    </style>
</head>
<body>
    <div class='container'>
        <h2>You're invited to take a survey!</h2>
        <p><strong>{context.SurveyTitle}</strong></p>
        <p>{context.SurveyDescription}</p>
        {(string.IsNullOrEmpty(context.PersonalMessage) ? "" : $"<p><em>\"{context.PersonalMessage}\"</em></p>")}
        <p><a href='{context.SurveyUrl}' class='button'>Take Survey</a></p>
        <div class='footer'>
            <p>Sent by {context.SenderName} from {context.OrganizationName}</p>
        </div>
    </div>
</body>
</html>";
    }

    private static string BuildNamespaceInvitationEmail(NamespaceInvitationContext context)
    {
        return $@"
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .button {{ display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px; }}
    </style>
</head>
<body>
    <div class='container'>
        <h2>You've been invited to join {context.NamespaceName}</h2>
        <p>{context.InviterName} has invited you to join their organization as a <strong>{context.Role}</strong>.</p>
        {(string.IsNullOrEmpty(context.PersonalMessage) ? "" : $"<p><em>\"{context.PersonalMessage}\"</em></p>")}
        <p><a href='{context.InviteUrl}' class='button'>Accept Invitation</a></p>
    </div>
</body>
</html>";
    }

    private static string BuildSurveyCompletionEmail(SurveyCompletionContext context)
    {
        return $@"
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .button {{ display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px; }}
    </style>
</head>
<body>
    <div class='container'>
        <h2>New Survey Response</h2>
        <p>A new response has been submitted for <strong>{context.SurveyTitle}</strong>.</p>
        <p>Total responses: {context.TotalResponses}</p>
        <p><a href='{context.DashboardUrl}' class='button'>View Dashboard</a></p>
    </div>
</body>
</html>";
    }
}
