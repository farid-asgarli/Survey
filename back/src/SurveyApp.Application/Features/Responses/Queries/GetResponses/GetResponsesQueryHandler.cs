using AutoMapper;
using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Domain.Entities;
using SurveyApp.Domain.Interfaces;

namespace SurveyApp.Application.Features.Responses.Queries.GetResponses;

public class GetResponsesQueryHandler(
    ISurveyResponseRepository responseRepository,
    ISurveyRepository surveyRepository,
    INamespaceRepository namespaceRepository,
    INamespaceContext namespaceContext,
    ICurrentUserService currentUserService,
    IMapper mapper
) : IRequestHandler<GetResponsesQuery, Result<PagedList<ResponseListItemDto>>>
{
    private readonly ISurveyResponseRepository _responseRepository = responseRepository;
    private readonly ISurveyRepository _surveyRepository = surveyRepository;
    private readonly INamespaceRepository _namespaceRepository = namespaceRepository;
    private readonly INamespaceContext _namespaceContext = namespaceContext;
    private readonly ICurrentUserService _currentUserService = currentUserService;
    private readonly IMapper _mapper = mapper;

    public async Task<Result<PagedList<ResponseListItemDto>>> Handle(
        GetResponsesQuery request,
        CancellationToken cancellationToken
    )
    {
        var namespaceId = _namespaceContext.CurrentNamespaceId;
        if (!namespaceId.HasValue)
        {
            return Result<PagedList<ResponseListItemDto>>.Failure(
                "Handler.NamespaceContextRequired"
            );
        }

        // Verify survey belongs to namespace
        var survey = await _surveyRepository.GetByIdAsync(request.SurveyId, cancellationToken);
        if (survey == null || survey.NamespaceId != namespaceId.Value)
        {
            return Result<PagedList<ResponseListItemDto>>.Failure("Handler.SurveyNotFound");
        }

        // Check permission
        var userId = _currentUserService.UserId;
        if (!userId.HasValue)
        {
            return Result<PagedList<ResponseListItemDto>>.Failure("Errors.UserNotAuthenticated");
        }

        var @namespace = await _namespaceRepository.GetByIdAsync(
            namespaceId.Value,
            cancellationToken
        );
        var membership = @namespace?.Memberships.FirstOrDefault(m => m.UserId == userId.Value);
        if (membership == null || !membership.HasPermission(NamespacePermission.ViewResponses))
        {
            return Result<PagedList<ResponseListItemDto>>.Failure(
                "You do not have permission to view responses."
            );
        }

        var (responses, totalCount) = await _responseRepository.GetPagedAsync(
            request.SurveyId,
            request.PageNumber,
            request.PageSize,
            request.IsCompleted,
            cancellationToken
        );

        var dtos = responses
            .Select(r => new ResponseListItemDto
            {
                Id = r.Id,
                RespondentEmail = r.RespondentEmail ?? r.Respondent?.Email,
                IsCompleted = r.IsComplete,
                CompletedAt = r.SubmittedAt,
                StartedAt = r.StartedAt,
                AnswerCount = r.Answers.Count,
            })
            .ToList();

        var pagedList = new PagedList<ResponseListItemDto>(
            dtos,
            totalCount,
            request.PageNumber,
            request.PageSize
        );
        return Result<PagedList<ResponseListItemDto>>.Success(pagedList);
    }
}
