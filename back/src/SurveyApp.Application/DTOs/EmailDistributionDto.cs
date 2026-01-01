using SurveyApp.Domain.Enums;

namespace SurveyApp.Application.DTOs;

/// <summary>
/// DTO for email template data.
/// </summary>
public class EmailTemplateDto
{
    public Guid Id { get; set; }
    public Guid NamespaceId { get; set; }
    public string Name { get; set; } = null!;
    public EmailTemplateType Type { get; set; }
    public string Subject { get; set; } = null!;
    public string HtmlBody { get; set; } = null!;
    public string? PlainTextBody { get; set; }

    /// <summary>
    /// JSON representation of the visual editor design state (blocks and styles).
    /// </summary>
    public string? DesignJson { get; set; }
    public bool IsDefault { get; set; }
    public IReadOnlyList<string> AvailablePlaceholders { get; set; } = [];
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    // Localization metadata
    public string DefaultLanguage { get; set; } = "en";
    public string Language { get; set; } = "en";
    public IReadOnlyList<string> AvailableLanguages { get; set; } = [];
}

/// <summary>
/// DTO for email template list item (summary).
/// </summary>
public class EmailTemplateSummaryDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = null!;
    public EmailTemplateType Type { get; set; }
    public string Subject { get; set; } = null!;
    public bool IsDefault { get; set; }
    public DateTime CreatedAt { get; set; }

    // Localization metadata
    public string DefaultLanguage { get; set; } = "en";
}

/// <summary>
/// DTO for creating an email template.
/// </summary>
public class CreateEmailTemplateDto
{
    public string Name { get; set; } = null!;
    public EmailTemplateType Type { get; set; }
    public string Subject { get; set; } = null!;
    public string HtmlBody { get; set; } = null!;
    public string? PlainTextBody { get; set; }

    /// <summary>
    /// JSON representation of the visual editor design state (blocks and styles).
    /// </summary>
    public string? DesignJson { get; set; }
    public bool IsDefault { get; set; }
}

/// <summary>
/// DTO for updating an email template.
/// </summary>
public class UpdateEmailTemplateDto
{
    public string? Name { get; set; }
    public EmailTemplateType? Type { get; set; }
    public string? Subject { get; set; }
    public string? HtmlBody { get; set; }
    public string? PlainTextBody { get; set; }

    /// <summary>
    /// JSON representation of the visual editor design state (blocks and styles).
    /// </summary>
    public string? DesignJson { get; set; }
    public bool? IsDefault { get; set; }
}

/// <summary>
/// DTO for email distribution data.
/// </summary>
public class EmailDistributionDto
{
    public Guid Id { get; set; }
    public Guid SurveyId { get; set; }
    public string SurveyTitle { get; set; } = null!;
    public Guid? EmailTemplateId { get; set; }
    public string? EmailTemplateName { get; set; }
    public string Subject { get; set; } = null!;
    public string Body { get; set; } = null!;
    public string? SenderName { get; set; }
    public string? SenderEmail { get; set; }
    public DateTime? ScheduledAt { get; set; }
    public DateTime? SentAt { get; set; }
    public DistributionStatus Status { get; set; }
    public DistributionStatsDto Stats { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

/// <summary>
/// DTO for email distribution list item (summary).
/// </summary>
public class EmailDistributionSummaryDto
{
    public Guid Id { get; set; }
    public Guid SurveyId { get; set; }
    public string SurveyTitle { get; set; } = null!;
    public string Subject { get; set; } = null!;
    public DateTime? ScheduledAt { get; set; }
    public DateTime? SentAt { get; set; }
    public DistributionStatus Status { get; set; }
    public int TotalRecipients { get; set; }
    public int SentCount { get; set; }
    public int OpenedCount { get; set; }
    public DateTime CreatedAt { get; set; }
}

/// <summary>
/// DTO for distribution statistics.
/// </summary>
public class DistributionStatsDto
{
    public Guid DistributionId { get; set; }
    public int TotalRecipients { get; set; }
    public int Sent { get; set; }
    public int Delivered { get; set; }
    public int Opened { get; set; }
    public int Clicked { get; set; }
    public int Bounced { get; set; }
    public int Failed { get; set; }

    public decimal DeliveryRate =>
        TotalRecipients > 0 ? Math.Round((decimal)Delivered / TotalRecipients * 100, 2) : 0;

    public decimal OpenRate => Delivered > 0 ? Math.Round((decimal)Opened / Delivered * 100, 2) : 0;

    public decimal ClickRate => Opened > 0 ? Math.Round((decimal)Clicked / Opened * 100, 2) : 0;
}

/// <summary>
/// DTO for creating an email distribution.
/// </summary>
public class CreateEmailDistributionDto
{
    public Guid SurveyId { get; set; }
    public Guid? EmailTemplateId { get; set; }
    public string Subject { get; set; } = null!;
    public string Body { get; set; } = null!;
    public string? SenderName { get; set; }
    public string? SenderEmail { get; set; }
    public List<RecipientInputDto> Recipients { get; set; } = [];
}

/// <summary>
/// DTO for recipient input.
/// </summary>
public class RecipientInputDto
{
    public string Email { get; set; } = null!;
    public string? Name { get; set; }
}

/// <summary>
/// DTO for scheduling a distribution.
/// </summary>
public class ScheduleDistributionDto
{
    public DateTime ScheduledAt { get; set; }
}

/// <summary>
/// DTO for email recipient data.
/// </summary>
public class EmailRecipientDto
{
    public Guid Id { get; set; }
    public string Email { get; set; } = null!;
    public string? Name { get; set; }
    public RecipientStatus Status { get; set; }
    public DateTime? SentAt { get; set; }
    public DateTime? DeliveredAt { get; set; }
    public DateTime? OpenedAt { get; set; }
    public DateTime? ClickedAt { get; set; }
    public int OpenCount { get; set; }
    public int ClickCount { get; set; }
    public string? ErrorMessage { get; set; }
}

/// <summary>
/// DTO for rendering a template preview.
/// </summary>
public class TemplatePreviewDto
{
    public string Subject { get; set; } = null!;
    public string HtmlBody { get; set; } = null!;
    public string? PlainTextBody { get; set; }
}

/// <summary>
/// DTO for sending a test email.
/// </summary>
public class SendTestEmailDto
{
    public string TestEmail { get; set; } = null!;
}
