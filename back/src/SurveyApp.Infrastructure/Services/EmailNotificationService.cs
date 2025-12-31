using Microsoft.Extensions.Localization;
using Microsoft.Extensions.Logging;
using SurveyApp.Application.Services;

namespace SurveyApp.Infrastructure.Services;

public class EmailNotificationService(
    ILogger<EmailNotificationService> logger,
    IStringLocalizer<EmailNotificationService> localizer
) : INotificationService
{
    private readonly ILogger<EmailNotificationService> _logger = logger;
    private readonly IStringLocalizer<EmailNotificationService> _localizer = localizer;

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
        var subject = string.Format(
            _localizer["Email.SurveyInvitationSubject"],
            context.SurveyTitle
        );
        var body = BuildSurveyInvitationEmail(context);
        return SendEmailAsync(to, subject, body, true, cancellationToken);
    }

    public Task SendNamespaceInvitationAsync(
        string to,
        NamespaceInvitationContext context,
        CancellationToken cancellationToken = default
    )
    {
        var subject = string.Format(
            _localizer["Email.NamespaceInvitationSubject"],
            context.NamespaceName
        );
        var body = BuildNamespaceInvitationEmail(context);
        return SendEmailAsync(to, subject, body, true, cancellationToken);
    }

    public Task SendSurveyCompletionNotificationAsync(
        string to,
        SurveyCompletionContext context,
        CancellationToken cancellationToken = default
    )
    {
        var subject = string.Format(_localizer["Email.NewResponseSubject"], context.SurveyTitle);
        var body = BuildSurveyCompletionEmail(context);
        return SendEmailAsync(to, subject, body, true, cancellationToken);
    }

    private string BuildSurveyInvitationEmail(SurveyInvitationContext context)
    {
        var heading = _localizer["Email.SurveyInvitationHeading"];
        var buttonText = _localizer["Email.TakeSurveyButton"];
        var sentByText = string.Format(
            _localizer["Email.SentBy"],
            context.SenderName,
            context.OrganizationName
        );

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
        <h2>{heading}</h2>
        <p><strong>{context.SurveyTitle}</strong></p>
        <p>{context.SurveyDescription}</p>
        {(string.IsNullOrEmpty(context.PersonalMessage) ? "" : $"<p><em>\"{context.PersonalMessage}\"</em></p>")}
        <p><a href='{context.SurveyUrl}' class='button'>{buttonText}</a></p>
        <div class='footer'>
            <p>{sentByText}</p>
        </div>
    </div>
</body>
</html>";
    }

    private string BuildNamespaceInvitationEmail(NamespaceInvitationContext context)
    {
        var heading = string.Format(
            _localizer["Email.NamespaceInvitationHeading"],
            context.NamespaceName
        );
        var bodyText = string.Format(
            _localizer["Email.NamespaceInvitationBody"],
            context.InviterName,
            context.Role
        );
        var buttonText = _localizer["Email.AcceptInvitationButton"];

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
        <h2>{heading}</h2>
        <p>{bodyText}</p>
        {(string.IsNullOrEmpty(context.PersonalMessage) ? "" : $"<p><em>\"{context.PersonalMessage}\"</em></p>")}
        <p><a href='{context.InviteUrl}' class='button'>{buttonText}</a></p>
    </div>
</body>
</html>";
    }

    private string BuildSurveyCompletionEmail(SurveyCompletionContext context)
    {
        var heading = _localizer["Email.NewResponseHeading"];
        var bodyText = string.Format(_localizer["Email.NewResponseBody"], context.SurveyTitle);
        var totalText = string.Format(_localizer["Email.TotalResponses"], context.TotalResponses);
        var buttonText = _localizer["Email.ViewDashboardButton"];

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
        <h2>{heading}</h2>
        <p>{bodyText}</p>
        <p>{totalText}</p>
        <p><a href='{context.DashboardUrl}' class='button'>{buttonText}</a></p>
    </div>
</body>
</html>";
    }
}
