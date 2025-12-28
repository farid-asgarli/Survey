using AutoMapper;
using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Domain.Interfaces;

namespace SurveyApp.Application.Features.RecurringSurveys.Queries.GetRecurringSurveyRuns;

/// <summary>
/// Handler for GetRecurringSurveyRunsQuery.
/// </summary>
public class GetRecurringSurveyRunsQueryHandler(
    IRecurringSurveyRepository recurringSurveyRepository,
    INamespaceContext namespaceContext,
    IMapper mapper
) : IRequestHandler<GetRecurringSurveyRunsQuery, Result<PagedList<RecurringSurveyRunDto>>>
{
    private readonly IRecurringSurveyRepository _recurringSurveyRepository =
        recurringSurveyRepository;
    private readonly INamespaceContext _namespaceContext = namespaceContext;
    private readonly IMapper _mapper = mapper;

    public async Task<Result<PagedList<RecurringSurveyRunDto>>> Handle(
        GetRecurringSurveyRunsQuery request,
        CancellationToken cancellationToken
    )
    {
        var namespaceId = _namespaceContext.CurrentNamespaceId;
        if (!namespaceId.HasValue)
        {
            return Result<PagedList<RecurringSurveyRunDto>>.Failure(
                "Namespace context is required."
            );
        }

        // Verify the recurring survey exists and belongs to this namespace
        var recurringSurvey = await _recurringSurveyRepository.GetByIdAsync(
            request.RecurringSurveyId,
            cancellationToken
        );

        if (recurringSurvey == null)
        {
            return Result<PagedList<RecurringSurveyRunDto>>.Failure("Recurring survey not found.");
        }

        if (recurringSurvey.NamespaceId != namespaceId.Value)
        {
            return Result<PagedList<RecurringSurveyRunDto>>.Failure(
                "Recurring survey does not belong to this namespace."
            );
        }

        var (items, totalCount) = await _recurringSurveyRepository.GetRunsPagedAsync(
            request.RecurringSurveyId,
            request.PageNumber,
            request.PageSize,
            cancellationToken
        );

        var dtos = items.Select(item => _mapper.Map<RecurringSurveyRunDto>(item)).ToList();

        var pagedList = new PagedList<RecurringSurveyRunDto>(
            dtos,
            totalCount,
            request.PageNumber,
            request.PageSize
        );

        return Result<PagedList<RecurringSurveyRunDto>>.Success(pagedList);
    }
}
