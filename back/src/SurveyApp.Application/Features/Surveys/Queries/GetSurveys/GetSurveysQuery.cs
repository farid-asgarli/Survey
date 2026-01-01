using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Application.DTOs.Common;
using SurveyApp.Domain.Enums;

namespace SurveyApp.Application.Features.Surveys.Queries.GetSurveys;

public record GetSurveysQuery : PagedQuery, IRequest<Result<PagedResponse<SurveyListItemDto>>>
{
    public SurveyStatus? Status { get; init; }
    public string? SearchTerm { get; init; }
    public string? SortBy { get; init; }
    public bool SortDescending { get; init; } = true;
}
