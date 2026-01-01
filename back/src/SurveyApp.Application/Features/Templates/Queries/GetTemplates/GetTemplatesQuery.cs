using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Application.DTOs.Common;

namespace SurveyApp.Application.Features.Templates.Queries.GetTemplates;

public record GetTemplatesQuery
    : PagedQuery,
        IRequest<Result<PagedResponse<SurveyTemplateSummaryDto>>>
{
    public string? SearchTerm { get; init; }
    public string? Category { get; init; }
    public bool? IsPublic { get; init; }
}
