using AutoMapper;
using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Application.DTOs.Common;
using SurveyApp.Domain.Interfaces;

namespace SurveyApp.Application.Features.SurveyLinks.Queries.GetSurveyLinks;

/// <summary>
/// Handler for getting all links for a survey with pagination.
/// </summary>
public class GetSurveyLinksQueryHandler(
    ISurveyLinkRepository surveyLinkRepository,
    ISurveyRepository surveyRepository,
    INamespaceContext namespaceContext,
    ICurrentUserService currentUserService,
    ILinkUrlService linkUrlService,
    IMapper mapper
) : IRequestHandler<GetSurveyLinksQuery, Result<PagedResponse<SurveyLinkDto>>>
{
    private readonly ISurveyLinkRepository _surveyLinkRepository = surveyLinkRepository;
    private readonly ISurveyRepository _surveyRepository = surveyRepository;
    private readonly INamespaceContext _namespaceContext = namespaceContext;
    private readonly ICurrentUserService _currentUserService = currentUserService;
    private readonly ILinkUrlService _linkUrlService = linkUrlService;
    private readonly IMapper _mapper = mapper;

    public async Task<Result<PagedResponse<SurveyLinkDto>>> Handle(
        GetSurveyLinksQuery request,
        CancellationToken cancellationToken
    )
    {
        var namespaceId = _namespaceContext.CurrentNamespaceId;
        if (!namespaceId.HasValue)
        {
            return Result<PagedResponse<SurveyLinkDto>>.Failure("Errors.NamespaceContextRequired");
        }

        var userId = _currentUserService.UserId;
        if (!userId.HasValue)
        {
            return Result<PagedResponse<SurveyLinkDto>>.Unauthorized("Errors.UserNotAuthenticated");
        }

        // Get the survey and verify it belongs to the namespace
        var survey = await _surveyRepository.GetByIdAsync(request.SurveyId, cancellationToken);
        if (survey == null)
        {
            return Result<PagedResponse<SurveyLinkDto>>.NotFound("Errors.SurveyNotFound");
        }

        if (survey.NamespaceId != namespaceId.Value)
        {
            return Result<PagedResponse<SurveyLinkDto>>.Failure("Errors.SurveyNotInNamespace");
        }

        // Get paginated links
        var (links, totalCount) = await _surveyLinkRepository.GetBySurveyIdPagedAsync(
            request.SurveyId,
            request.PageNumber,
            request.PageSize,
            request.IsActive,
            cancellationToken
        );

        // Get actual counts from database for accuracy
        var linkIds = links.Select(l => l.Id).ToList();
        var clickCounts = await _surveyLinkRepository.GetClickCountsAsync(
            linkIds,
            cancellationToken
        );
        var responseCounts = await _surveyLinkRepository.GetResponseCountsAsync(
            linkIds,
            cancellationToken
        );

        var dtos = links
            .Select(l =>
            {
                var dto = _mapper.Map<SurveyLinkDto>(l);
                dto.FullUrl = _linkUrlService.BuildLinkUrl(l.Token);
                // Override with actual counts from database
                dto.UsageCount = clickCounts.GetValueOrDefault(l.Id, 0);
                dto.ResponseCount = responseCounts.GetValueOrDefault(l.Id, 0);
                return dto;
            })
            .ToList();

        var pagedResponse = PagedResponse<SurveyLinkDto>.Create(
            dtos,
            request.PageNumber,
            request.PageSize,
            totalCount
        );

        return Result<PagedResponse<SurveyLinkDto>>.Success(pagedResponse);
    }
}
