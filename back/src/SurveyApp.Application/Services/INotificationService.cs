namespace SurveyApp.Application.Services;

public interface INotificationService
{
    Task SendEmailAsync(
        string to,
        string subject,
        string body,
        bool isHtml = true,
        CancellationToken cancellationToken = default
    );
    Task SendEmailAsync(
        IEnumerable<string> to,
        string subject,
        string body,
        bool isHtml = true,
        CancellationToken cancellationToken = default
    );
    Task SendSurveyInvitationAsync(
        string to,
        SurveyInvitationContext context,
        CancellationToken cancellationToken = default
    );
    Task SendNamespaceInvitationAsync(
        string to,
        NamespaceInvitationContext context,
        CancellationToken cancellationToken = default
    );
    Task SendSurveyCompletionNotificationAsync(
        string to,
        SurveyCompletionContext context,
        CancellationToken cancellationToken = default
    );
}

public record SurveyInvitationContext
{
    public string SurveyTitle { get; init; } = string.Empty;
    public string SurveyDescription { get; init; } = string.Empty;
    public string SurveyUrl { get; init; } = string.Empty;
    public string? PersonalMessage { get; init; }
    public string SenderName { get; init; } = string.Empty;
    public string OrganizationName { get; init; } = string.Empty;
}

public record NamespaceInvitationContext
{
    public string NamespaceName { get; init; } = string.Empty;
    public string Role { get; init; } = string.Empty;
    public string InviteUrl { get; init; } = string.Empty;
    public string InviterName { get; init; } = string.Empty;
    public string? PersonalMessage { get; init; }
}

public record SurveyCompletionContext
{
    public string SurveyTitle { get; init; } = string.Empty;
    public int TotalResponses { get; init; }
    public string DashboardUrl { get; init; } = string.Empty;
}
