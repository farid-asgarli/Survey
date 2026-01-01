using AutoMapper;
using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Application.DTOs.Common;
using SurveyApp.Domain.Entities;
using SurveyApp.Domain.Interfaces;
using SurveyApp.Domain.Specifications;
using SurveyApp.Domain.Specifications.Responses;

namespace SurveyApp.Application.Features.Responses.Queries.GetResponses;

public class GetResponsesQueryHandler(
    ISpecificationRepository<SurveyResponse> responseSpecRepository,
    ISurveyRepository surveyRepository,
    INamespaceRepository namespaceRepository,
    INamespaceContext namespaceContext,
    ICurrentUserService currentUserService,
    IMapper mapper
) : IRequestHandler<GetResponsesQuery, Result<PagedResponse<ResponseListItemDto>>>
{
    private readonly ISpecificationRepository<SurveyResponse> _responseSpecRepository =
        responseSpecRepository;
    private readonly ISurveyRepository _surveyRepository = surveyRepository;
    private readonly INamespaceRepository _namespaceRepository = namespaceRepository;
    private readonly INamespaceContext _namespaceContext = namespaceContext;
    private readonly ICurrentUserService _currentUserService = currentUserService;
    private readonly IMapper _mapper = mapper;

    public async Task<Result<PagedResponse<ResponseListItemDto>>> Handle(
        GetResponsesQuery request,
        CancellationToken cancellationToken
    )
    {
        var namespaceId = _namespaceContext.CurrentNamespaceId;
        if (!namespaceId.HasValue)
        {
            return Result<PagedResponse<ResponseListItemDto>>.Failure(
                "Errors.NamespaceContextRequired"
            );
        }

        // Verify survey belongs to namespace
        var survey = await _surveyRepository.GetByIdAsync(request.SurveyId, cancellationToken);
        if (survey == null || survey.NamespaceId != namespaceId.Value)
        {
            return Result<PagedResponse<ResponseListItemDto>>.NotFound("Errors.SurveyNotFound");
        }

        // Check permission
        var userId = _currentUserService.UserId;
        if (!userId.HasValue)
        {
            return Result<PagedResponse<ResponseListItemDto>>.Failure(
                "Errors.UserNotAuthenticated"
            );
        }

        var @namespace = await _namespaceRepository.GetByIdAsync(
            namespaceId.Value,
            cancellationToken
        );
        var membership = @namespace?.Memberships.FirstOrDefault(m => m.UserId == userId.Value);
        if (membership == null || !membership.HasPermission(NamespacePermission.ViewResponses))
        {
            return Result<PagedResponse<ResponseListItemDto>>.Failure(
                "You do not have permission to view responses."
            );
        }

        // Build specification with filter criteria
        var filterCriteria = new ResponseFilterCriteria
        {
            SurveyId = request.SurveyId,
            IsComplete = request.IsComplete,
            FromDate = request.FromDate,
            ToDate = request.ToDate,
            Paging = PagingParameters.Create(request.PageNumber, request.PageSize),
            IncludeAnswers = true,
        };

        var spec = new ResponsesFilteredSpec(filterCriteria);
        var (responses, totalCount) = await _responseSpecRepository.GetPagedAsync(
            spec,
            cancellationToken
        );

        var dtos = responses
            .Select(r => new ResponseListItemDto
            {
                Id = r.Id,
                SurveyId = r.SurveyId,
                SurveyTitle = survey.Title,
                RespondentEmail = r.RespondentEmail ?? r.Respondent?.Email,
                RespondentName = r.RespondentName,
                IsComplete = r.IsComplete,
                StartedAt = r.StartedAt,
                SubmittedAt = r.SubmittedAt,
                TimeSpentSeconds = r.TimeSpentSeconds,
                AnswerCount = r.Answers.Count,
            })
            .ToList();

        var pagedResponse = PagedResponse<ResponseListItemDto>.Create(
            dtos,
            request.PageNumber,
            request.PageSize,
            totalCount
        );
        return Result<PagedResponse<ResponseListItemDto>>.Success(pagedResponse);
    }
}
