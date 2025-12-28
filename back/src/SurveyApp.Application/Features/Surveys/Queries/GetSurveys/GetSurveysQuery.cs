using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.DTOs;
using SurveyApp.Domain.Enums;

namespace SurveyApp.Application.Features.Surveys.Queries.GetSurveys;

public record GetSurveysQuery : IRequest<Result<PagedList<SurveyListItemDto>>>
{
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 10;
    public SurveyStatus? Status { get; init; }
    public string? SearchTerm { get; init; }
    public string? SortBy { get; init; }
    public bool SortDescending { get; init; } = true;
}
