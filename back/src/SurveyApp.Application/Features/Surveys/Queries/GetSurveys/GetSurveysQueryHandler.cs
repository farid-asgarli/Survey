using AutoMapper;
using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Domain.Entities;
using SurveyApp.Domain.Interfaces;

namespace SurveyApp.Application.Features.Surveys.Queries.GetSurveys;

public class GetSurveysQueryHandler(
    ISurveyRepository surveyRepository,
    INamespaceRepository namespaceRepository,
    INamespaceContext namespaceContext,
    ICurrentUserService currentUserService,
    IMapper mapper
) : IRequestHandler<GetSurveysQuery, Result<PagedList<SurveyListItemDto>>>
{
    private readonly ISurveyRepository _surveyRepository = surveyRepository;
    private readonly INamespaceRepository _namespaceRepository = namespaceRepository;
    private readonly INamespaceContext _namespaceContext = namespaceContext;
    private readonly ICurrentUserService _currentUserService = currentUserService;
    private readonly IMapper _mapper = mapper;

    public async Task<Result<PagedList<SurveyListItemDto>>> Handle(
        GetSurveysQuery request,
        CancellationToken cancellationToken
    )
    {
        var namespaceId = _namespaceContext.CurrentNamespaceId;
        if (!namespaceId.HasValue)
        {
            return Result<PagedList<SurveyListItemDto>>.Failure("Handler.NamespaceContextRequired");
        }

        // Check permission
        var userId = _currentUserService.UserId;
        if (!userId.HasValue)
        {
            return Result<PagedList<SurveyListItemDto>>.Failure("Errors.UserNotAuthenticated");
        }

        var @namespace = await _namespaceRepository.GetByIdAsync(
            namespaceId.Value,
            cancellationToken
        );
        var membership = @namespace?.Memberships.FirstOrDefault(m => m.UserId == userId.Value);
        if (membership == null || !membership.HasPermission(NamespacePermission.ViewSurveys))
        {
            return Result<PagedList<SurveyListItemDto>>.Failure(
                "You do not have permission to view surveys."
            );
        }

        var (surveys, totalCount) = await _surveyRepository.GetPagedAsync(
            namespaceId.Value,
            request.PageNumber,
            request.PageSize,
            request.SearchTerm,
            request.Status,
            request.SortBy,
            request.SortDescending,
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

        var pagedList = new PagedList<SurveyListItemDto>(
            dtos,
            request.PageNumber,
            request.PageSize,
            totalCount
        );
        return Result<PagedList<SurveyListItemDto>>.Success(pagedList);
    }
}
