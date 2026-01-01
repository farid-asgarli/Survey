using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Application.DTOs.Common;

namespace SurveyApp.Application.Features.SurveyLinks.Queries.GetSurveyLinks;

/// <summary>
/// Query to get all links for a survey with pagination.
/// </summary>
public record GetSurveyLinksQuery : PagedQuery, IRequest<Result<PagedResponse<SurveyLinkDto>>>
{
    public Guid SurveyId { get; init; }
    public bool? IsActive { get; init; }
}
