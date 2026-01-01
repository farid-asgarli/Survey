using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.DTOs;

namespace SurveyApp.Application.Features.Surveys.Queries.GetSurveyAnalytics;

public record GetSurveyAnalyticsQuery(Guid SurveyId) : IRequest<Result<SurveyAnalyticsDto>>;
