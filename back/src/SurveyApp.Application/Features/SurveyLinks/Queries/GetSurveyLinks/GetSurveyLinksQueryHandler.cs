using AutoMapper;
using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Domain.Interfaces;

namespace SurveyApp.Application.Features.SurveyLinks.Queries.GetSurveyLinks;

/// <summary>
/// Handler for getting all links for a survey.
/// </summary>
public class GetSurveyLinksQueryHandler(
    ISurveyLinkRepository surveyLinkRepository,
    ISurveyRepository surveyRepository,
    INamespaceContext namespaceContext,
    ICurrentUserService currentUserService,
    ILinkUrlService linkUrlService,
    IMapper mapper
) : IRequestHandler<GetSurveyLinksQuery, Result<List<SurveyLinkDto>>>
{
    private readonly ISurveyLinkRepository _surveyLinkRepository = surveyLinkRepository;
    private readonly ISurveyRepository _surveyRepository = surveyRepository;
    private readonly INamespaceContext _namespaceContext = namespaceContext;
    private readonly ICurrentUserService _currentUserService = currentUserService;
    private readonly ILinkUrlService _linkUrlService = linkUrlService;
    private readonly IMapper _mapper = mapper;

    public async Task<Result<List<SurveyLinkDto>>> Handle(
        GetSurveyLinksQuery request,
        CancellationToken cancellationToken
    )
    {
        var namespaceId = _namespaceContext.CurrentNamespaceId;
        if (!namespaceId.HasValue)
        {
            return Result<List<SurveyLinkDto>>.Failure("Handler.NamespaceContextRequired");
        }

        var userId = _currentUserService.UserId;
        if (!userId.HasValue)
        {
            return Result<List<SurveyLinkDto>>.Failure("User not authenticated.");
        }

        // Get the survey and verify it belongs to the namespace
        var survey = await _surveyRepository.GetByIdAsync(request.SurveyId, cancellationToken);
        if (survey == null)
        {
            return Result<List<SurveyLinkDto>>.Failure("Handler.SurveyNotFound");
        }

        if (survey.NamespaceId != namespaceId.Value)
        {
            return Result<List<SurveyLinkDto>>.Failure("Survey does not belong to this namespace.");
        }

        // Get links
        var links = await _surveyLinkRepository.GetBySurveyIdAsync(
            request.SurveyId,
            request.IsActive,
            cancellationToken
        );

        var dtos = links
            .Select(l =>
            {
                var dto = _mapper.Map<SurveyLinkDto>(l);
                dto.FullUrl = _linkUrlService.BuildLinkUrl(l.Token);
                return dto;
            })
            .ToList();

        return Result<List<SurveyLinkDto>>.Success(dtos);
    }
}
