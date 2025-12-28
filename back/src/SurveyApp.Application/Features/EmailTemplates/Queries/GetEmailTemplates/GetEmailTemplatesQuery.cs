using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.DTOs;
using SurveyApp.Domain.Enums;

namespace SurveyApp.Application.Features.EmailTemplates.Queries.GetEmailTemplates;

/// <summary>
/// Query to get all email templates in the current namespace.
/// </summary>
public record GetEmailTemplatesQuery : IRequest<Result<IReadOnlyList<EmailTemplateSummaryDto>>>
{
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 20;
    public string? SearchTerm { get; init; }
    public EmailTemplateType? Type { get; init; }
}
