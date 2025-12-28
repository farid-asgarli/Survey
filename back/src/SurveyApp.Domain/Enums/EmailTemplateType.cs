namespace SurveyApp.Domain.Enums;

/// <summary>
/// Represents the type of email template.
/// </summary>
public enum EmailTemplateType
{
    /// <summary>
    /// Survey invitation email.
    /// </summary>
    SurveyInvitation,

    /// <summary>
    /// Survey reminder email.
    /// </summary>
    SurveyReminder,

    /// <summary>
    /// Thank you email after completion.
    /// </summary>
    ThankYou,

    /// <summary>
    /// Custom email template.
    /// </summary>
    Custom,
}
