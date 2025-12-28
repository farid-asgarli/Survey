using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.DTOs;

namespace SurveyApp.Application.Features.Surveys.Queries.GetSurveyAnalytics;

public record GetSurveyAnalyticsQuery : IRequest<Result<SurveyAnalyticsDto>>
{
    public Guid SurveyId { get; init; }
}
