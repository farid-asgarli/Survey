using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.DTOs;
using SurveyApp.Application.DTOs.Common;

namespace SurveyApp.Application.Features.Templates.Queries.GetTemplates;

public record GetTemplatesQuery : IRequest<Result<PagedResponse<SurveyTemplateSummaryDto>>>
{
    public int PageNumber { get; init; } = PaginationDefaults.DefaultPageNumber;
    public int PageSize { get; init; } = PaginationDefaults.DefaultPageSize;
    public string? SearchTerm { get; init; }
    public string? Category { get; init; }
    public bool? IsPublic { get; init; }
}
