using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.DTOs;
using SurveyApp.Application.Services;

namespace SurveyApp.Application.Features.Nps.Queries.GetNpsTrend;

/// <summary>
/// Query to get NPS trend over time for a survey.
/// </summary>
public record GetNpsTrendQuery : IRequest<Result<NpsTrendDto>>
{
    /// <summary>
    /// Gets or sets the survey ID.
    /// </summary>
    public Guid SurveyId { get; init; }

    /// <summary>
    /// Gets or sets the start date for the trend analysis.
    /// </summary>
    public DateTime FromDate { get; init; }

    /// <summary>
    /// Gets or sets the end date for the trend analysis.
    /// </summary>
    public DateTime ToDate { get; init; }

    /// <summary>
    /// Gets or sets how the trend data should be grouped.
    /// </summary>
    public NpsTrendGroupBy GroupBy { get; init; } = NpsTrendGroupBy.Week;
}
