using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.DTOs;

namespace SurveyApp.Application.Features.SurveyLinks.Queries.GetLinkAnalytics;

/// <summary>
/// Query to get analytics for a survey link.
/// </summary>
public record GetLinkAnalyticsQuery : IRequest<Result<LinkAnalyticsDto>>
{
    public Guid SurveyId { get; init; }
    public Guid LinkId { get; init; }
    public DateTime? StartDate { get; init; }
    public DateTime? EndDate { get; init; }
}
