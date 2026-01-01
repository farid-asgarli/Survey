namespace SurveyApp.Application.Features.EmailTemplates.Commands.DuplicateEmailTemplate;

/// <summary>
/// Request body for duplicating an email template.
/// The template ID comes from the route parameter.
/// </summary>
public record DuplicateEmailTemplateRequest(string? NewName = null);
