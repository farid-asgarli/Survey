using AutoMapper;
using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Application.DTOs.Common;
using SurveyApp.Domain.Entities;
using SurveyApp.Domain.Interfaces;
using SurveyApp.Domain.Specifications;
using SurveyApp.Domain.Specifications.RecurringSurveys;

namespace SurveyApp.Application.Features.RecurringSurveys.Queries.GetRecurringSurveys;

/// <summary>
/// Handler for GetRecurringSurveysQuery.
/// </summary>
public class GetRecurringSurveysQueryHandler(
    ISpecificationRepository<RecurringSurvey> recurringSurveyRepository,
    ISurveyRepository surveyRepository,
    INamespaceContext namespaceContext,
    IMapper mapper
) : IRequestHandler<GetRecurringSurveysQuery, Result<PagedResponse<RecurringSurveyListItemDto>>>
{
    private readonly ISpecificationRepository<RecurringSurvey> _recurringSurveyRepository =
        recurringSurveyRepository;
    private readonly ISurveyRepository _surveyRepository = surveyRepository;
    private readonly INamespaceContext _namespaceContext = namespaceContext;
    private readonly IMapper _mapper = mapper;

    public async Task<Result<PagedResponse<RecurringSurveyListItemDto>>> Handle(
        GetRecurringSurveysQuery request,
        CancellationToken cancellationToken
    )
    {
        var namespaceId = _namespaceContext.CurrentNamespaceId;
        if (!namespaceId.HasValue)
        {
            return Result<PagedResponse<RecurringSurveyListItemDto>>.Failure(
                "Errors.NamespaceContextRequired"
            );
        }

        // Use specification pattern for querying
        var criteria = new RecurringSurveyFilterCriteria
        {
            NamespaceId = namespaceId.Value,
            SearchTerm = request.SearchTerm,
            IsActive = request.IsActive,
            Paging = PagingParameters.Create(request.PageNumber, request.PageSize),
        };

        var spec = new RecurringSurveysFilteredSpec(criteria);
        var (items, totalCount) = await _recurringSurveyRepository.GetPagedAsync(
            spec,
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

        var pagedResponse = PagedResponse<RecurringSurveyListItemDto>.Create(
            dtos,
            request.PageNumber,
            request.PageSize,
            totalCount
        );

        return Result<PagedResponse<RecurringSurveyListItemDto>>.Success(pagedResponse);
    }
}
