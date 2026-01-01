using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.DTOs;
using SurveyApp.Application.DTOs.Common;
using SurveyApp.Domain.Enums;

namespace SurveyApp.Application.Features.EmailTemplates.Queries.GetEmailTemplates;

/// <summary>
/// Query to get all email templates in the current namespace.
/// </summary>
public record GetEmailTemplatesQuery : IRequest<Result<PagedResponse<EmailTemplateSummaryDto>>>
{
    public int PageNumber { get; init; } = PaginationDefaults.DefaultPageNumber;
    public int PageSize { get; init; } = PaginationDefaults.DefaultPageSize;
    public string? SearchTerm { get; init; }
    public EmailTemplateType? Type { get; init; }
}
