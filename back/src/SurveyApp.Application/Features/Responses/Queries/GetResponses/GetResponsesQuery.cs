using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Application.DTOs.Common;

namespace SurveyApp.Application.Features.Responses.Queries.GetResponses;

public record GetResponsesQuery : PagedQuery, IRequest<Result<PagedResponse<ResponseListItemDto>>>
{
    public Guid SurveyId { get; init; }
    public bool? IsComplete { get; init; }
    public DateTime? FromDate { get; init; }
    public DateTime? ToDate { get; init; }
}
