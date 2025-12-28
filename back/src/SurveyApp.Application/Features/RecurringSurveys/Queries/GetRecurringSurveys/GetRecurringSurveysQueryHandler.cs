using AutoMapper;
using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Domain.Interfaces;

namespace SurveyApp.Application.Features.RecurringSurveys.Queries.GetRecurringSurveys;

/// <summary>
/// Handler for GetRecurringSurveysQuery.
/// </summary>
public class GetRecurringSurveysQueryHandler(
    IRecurringSurveyRepository recurringSurveyRepository,
    ISurveyRepository surveyRepository,
    INamespaceContext namespaceContext,
    IMapper mapper
) : IRequestHandler<GetRecurringSurveysQuery, Result<PagedList<RecurringSurveyListItemDto>>>
{
    private readonly IRecurringSurveyRepository _recurringSurveyRepository =
        recurringSurveyRepository;
    private readonly ISurveyRepository _surveyRepository = surveyRepository;
    private readonly INamespaceContext _namespaceContext = namespaceContext;
    private readonly IMapper _mapper = mapper;

    public async Task<Result<PagedList<RecurringSurveyListItemDto>>> Handle(
        GetRecurringSurveysQuery request,
        CancellationToken cancellationToken
    )
    {
        var namespaceId = _namespaceContext.CurrentNamespaceId;
        if (!namespaceId.HasValue)
        {
            return Result<PagedList<RecurringSurveyListItemDto>>.Failure(
                "Handler.NamespaceContextRequired"
            );
        }

        var (items, totalCount) = await _recurringSurveyRepository.GetPagedAsync(
            namespaceId.Value,
            request.PageNumber,
            request.PageSize,
            request.SearchTerm,
            request.IsActive,
            cancellationToken
        );

        // Get survey titles for each recurring survey
        var surveyIds = items.Select(r => r.SurveyId).Distinct().ToList();
        var surveys = new Dictionary<Guid, string>();
        foreach (var surveyId in surveyIds)
        {
            var survey = await _surveyRepository.GetByIdAsync(surveyId, cancellationToken);
            if (survey != null)
            {
                surveys[surveyId] = survey.Title;
            }
        }

        var dtos = items
            .Select(item =>
            {
                var dto = _mapper.Map<RecurringSurveyListItemDto>(item);
                dto.SurveyTitle = surveys.GetValueOrDefault(item.SurveyId, "Unknown");
                dto.RecipientCount = item.RecipientEmails.Length;
                return dto;
            })
            .ToList();

        var pagedList = new PagedList<RecurringSurveyListItemDto>(
            dtos,
            totalCount,
            request.PageNumber,
            request.PageSize
        );

        return Result<PagedList<RecurringSurveyListItemDto>>.Success(pagedList);
    }
}
