using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.DTOs;
using SurveyApp.Application.DTOs.Common;

namespace SurveyApp.Application.Features.Responses.Queries.GetResponses;

public record GetResponsesQuery : IRequest<Result<PagedResponse<ResponseListItemDto>>>
{
    public Guid SurveyId { get; init; }
    public int PageNumber { get; init; } = PaginationDefaults.DefaultPageNumber;
    public int PageSize { get; init; } = PaginationDefaults.DefaultPageSize;
    public bool? IsComplete { get; init; }
    public DateTime? FromDate { get; init; }
    public DateTime? ToDate { get; init; }
}
