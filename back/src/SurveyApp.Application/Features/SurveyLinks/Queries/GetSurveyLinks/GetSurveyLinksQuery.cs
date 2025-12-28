using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.DTOs;

namespace SurveyApp.Application.Features.SurveyLinks.Queries.GetSurveyLinks;

/// <summary>
/// Query to get all links for a survey.
/// </summary>
public record GetSurveyLinksQuery : IRequest<Result<List<SurveyLinkDto>>>
{
    public Guid SurveyId { get; init; }
    public bool? IsActive { get; init; }
}
