using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.DTOs;

namespace SurveyApp.Application.Features.Nps.Queries.GetSurveyNps;

/// <summary>
/// Query to get NPS score for an entire survey.
/// </summary>
/// <param name="SurveyId">The survey ID.</param>
public record GetSurveyNpsQuery(Guid SurveyId) : IRequest<Result<SurveyNpsSummaryDto>>;
