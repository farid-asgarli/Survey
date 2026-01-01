using AutoMapper;
using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Application.DTOs.Common;
using SurveyApp.Domain.Entities;
using SurveyApp.Domain.Interfaces;
using SurveyApp.Domain.Specifications;
using SurveyApp.Domain.Specifications.Surveys;

namespace SurveyApp.Application.Features.Surveys.Queries.GetSurveys;

public class GetSurveysQueryHandler(
    ISpecificationRepository<Survey> surveySpecRepository,
    INamespaceRepository namespaceRepository,
    INamespaceContext namespaceContext,
    ICurrentUserService currentUserService,
    IMapper mapper
) : IRequestHandler<GetSurveysQuery, Result<PagedResponse<SurveyListItemDto>>>
{
    private readonly ISpecificationRepository<Survey> _surveySpecRepository = surveySpecRepository;
    private readonly INamespaceRepository _namespaceRepository = namespaceRepository;
    private readonly INamespaceContext _namespaceContext = namespaceContext;
    private readonly ICurrentUserService _currentUserService = currentUserService;
    private readonly IMapper _mapper = mapper;

    public async Task<Result<PagedResponse<SurveyListItemDto>>> Handle(
        GetSurveysQuery request,
        CancellationToken cancellationToken
    )
    {
        var namespaceId = _namespaceContext.CurrentNamespaceId;
        if (!namespaceId.HasValue)
        {
            return Result<PagedResponse<SurveyListItemDto>>.Failure(
                "Errors.NamespaceContextRequired"
            );
        }

        // Check permission
        var userId = _currentUserService.UserId;
        if (!userId.HasValue)
        {
            return Result<PagedResponse<SurveyListItemDto>>.Unauthorized("Errors.UserNotAuthenticated");
        }

        var @namespace = await _namespaceRepository.GetByIdAsync(
            namespaceId.Value,
            cancellationToken
        );
        var membership = @namespace?.Memberships.FirstOrDefault(m => m.UserId == userId.Value);
        if (membership == null || !membership.HasPermission(NamespacePermission.ViewSurveys))
        {
            return Result<PagedResponse<SurveyListItemDto>>.Failure(
                "You do not have permission to view surveys."
            );
        }

        // Build specification with filter criteria
        var filterCriteria = new SurveyFilterCriteria
        {
            NamespaceId = namespaceId.Value,
            Status = request.Status,
            SearchTerm = request.SearchTerm,
            Sorting = SortingParameters.Create(request.SortBy, request.SortDescending),
            Paging = PagingParameters.Create(request.PageNumber, request.PageSize),
            IncludeResponses = true,
        };

        var spec = new SurveysFilteredSpec(filterCriteria);
        var (surveys, totalCount) = await _surveySpecRepository.GetPagedAsync(
            spec,
            cancellationToken
        );

        // Map surveys - Title and Description come from default translation via computed properties
        var dtos = surveys
            .Select(s => new SurveyListItemDto
            {
                Id = s.Id,
                Title = s.Title,
                Description = s.Description,
                Type = s.Type,
                CxMetricType = s.CxMetricType,
                Status = s.Status,
                ResponseCount = s.Responses.Count,
                QuestionCount = s.Questions.Count,
                CreatedAt = s.CreatedAt,
                PublishedAt = s.PublishedAt,
                ClosedAt = s.ClosedAt,
                DefaultLanguage = s.DefaultLanguage,
            })
            .ToList();

        var pagedResponse = PagedResponse<SurveyListItemDto>.Create(
            dtos,
            request.PageNumber,
            request.PageSize,
            totalCount
        );
        return Result<PagedResponse<SurveyListItemDto>>.Success(pagedResponse);
    }
}
