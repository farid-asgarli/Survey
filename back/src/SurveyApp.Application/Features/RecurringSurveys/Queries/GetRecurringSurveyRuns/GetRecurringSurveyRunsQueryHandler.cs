using AutoMapper;
using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Application.DTOs.Common;
using SurveyApp.Domain.Interfaces;

namespace SurveyApp.Application.Features.RecurringSurveys.Queries.GetRecurringSurveyRuns;

/// <summary>
/// Handler for GetRecurringSurveyRunsQuery.
/// </summary>
public class GetRecurringSurveyRunsQueryHandler(
    IRecurringSurveyRepository recurringSurveyRepository,
    INamespaceContext namespaceContext,
    IMapper mapper
) : IRequestHandler<GetRecurringSurveyRunsQuery, Result<PagedResponse<RecurringSurveyRunDto>>>
{
    private readonly IRecurringSurveyRepository _recurringSurveyRepository =
        recurringSurveyRepository;
    private readonly INamespaceContext _namespaceContext = namespaceContext;
    private readonly IMapper _mapper = mapper;

    public async Task<Result<PagedResponse<RecurringSurveyRunDto>>> Handle(
        GetRecurringSurveyRunsQuery request,
        CancellationToken cancellationToken
    )
    {
        var namespaceId = _namespaceContext.CurrentNamespaceId;
        if (!namespaceId.HasValue)
        {
            return Result<PagedResponse<RecurringSurveyRunDto>>.Failure(
                "Errors.NamespaceContextRequired"
            );
        }

        // Verify the recurring survey exists and belongs to this namespace
        var recurringSurvey = await _recurringSurveyRepository.GetByIdAsync(
            request.RecurringSurveyId,
            cancellationToken
        );

        if (recurringSurvey == null)
        {
            return Result<PagedResponse<RecurringSurveyRunDto>>.Failure(
                "Errors.RecurringSurveyNotFound"
            );
        }

        if (recurringSurvey.NamespaceId != namespaceId.Value)
        {
            return Result<PagedResponse<RecurringSurveyRunDto>>.Failure(
                "Errors.RecurringSurveyNotInNamespace"
            );
        }

        var (items, totalCount) = await _recurringSurveyRepository.GetRunsPagedAsync(
            request.RecurringSurveyId,
            request.PageNumber,
            request.PageSize,
            cancellationToken
        );

        var dtos = items.Select(item => _mapper.Map<RecurringSurveyRunDto>(item)).ToList();

        var pagedResponse = PagedResponse<RecurringSurveyRunDto>.Create(
            dtos,
            request.PageNumber,
            request.PageSize,
            totalCount
        );

        return Result<PagedResponse<RecurringSurveyRunDto>>.Success(pagedResponse);
    }
}
