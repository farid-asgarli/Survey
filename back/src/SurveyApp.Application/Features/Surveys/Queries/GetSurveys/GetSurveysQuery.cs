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

    /// <summary>
    /// Filter surveys created on or after this date (inclusive).
    /// </summary>
    public DateTime? FromDate { get; init; }

    /// <summary>
    /// Filter surveys created on or before this date (inclusive).
    /// </summary>
    public DateTime? ToDate { get; init; }

    /// <summary>
    /// Filter surveys by category ID.
    /// </summary>
    public Guid? CategoryId { get; init; }

    public string? SortBy { get; init; }
    public bool SortDescending { get; init; } = true;
}
