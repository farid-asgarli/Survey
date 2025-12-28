using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.DTOs;

namespace SurveyApp.Application.Features.Templates.Queries.GetTemplates;

public record GetTemplatesQuery : IRequest<Result<PagedList<SurveyTemplateSummaryDto>>>
{
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 10;
    public string? SearchTerm { get; init; }
    public string? Category { get; init; }
    public bool? IsPublic { get; init; }
}
