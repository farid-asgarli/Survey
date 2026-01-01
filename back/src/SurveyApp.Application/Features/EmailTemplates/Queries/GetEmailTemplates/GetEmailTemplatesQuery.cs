using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Application.DTOs.Common;
using SurveyApp.Domain.Enums;

namespace SurveyApp.Application.Features.EmailTemplates.Queries.GetEmailTemplates;

/// <summary>
/// Query to get all email templates in the current namespace.
/// </summary>
public record GetEmailTemplatesQuery
    : PagedQuery,
        IRequest<Result<PagedResponse<EmailTemplateSummaryDto>>>
{
    public string? SearchTerm { get; init; }
    public EmailTemplateType? Type { get; init; }
}
