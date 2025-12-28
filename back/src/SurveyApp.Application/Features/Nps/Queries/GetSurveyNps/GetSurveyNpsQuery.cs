using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.DTOs;

namespace SurveyApp.Application.Features.Nps.Queries.GetSurveyNps;

/// <summary>
/// Query to get NPS score for an entire survey.
/// </summary>
public record GetSurveyNpsQuery : IRequest<Result<SurveyNpsSummaryDto>>
{
    /// <summary>
    /// Gets or sets the survey ID.
    /// </summary>
    public Guid SurveyId { get; init; }
}
