using System.Text.Json;
using AutoMapper;
using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Domain.Interfaces;

namespace SurveyApp.Application.Features.SurveyLinks.Queries.GetSurveyLinkById;

/// <summary>
/// Handler for getting a survey link by ID.
/// </summary>
public class GetSurveyLinkByIdQueryHandler(
    ISurveyLinkRepository surveyLinkRepository,
    ISurveyRepository surveyRepository,
    INamespaceContext namespaceContext,
    ICurrentUserService currentUserService,
    ILinkUrlService linkUrlService,
    IMapper mapper
) : IRequestHandler<GetSurveyLinkByIdQuery, Result<SurveyLinkDetailsDto>>
{
    private readonly ISurveyLinkRepository _surveyLinkRepository = surveyLinkRepository;
    private readonly ISurveyRepository _surveyRepository = surveyRepository;
    private readonly INamespaceContext _namespaceContext = namespaceContext;
    private readonly ICurrentUserService _currentUserService = currentUserService;
    private readonly ILinkUrlService _linkUrlService = linkUrlService;
    private readonly IMapper _mapper = mapper;

    public async Task<Result<SurveyLinkDetailsDto>> Handle(
        GetSurveyLinkByIdQuery request,
        CancellationToken cancellationToken
    )
    {
        var namespaceId = _namespaceContext.CurrentNamespaceId;
        if (!namespaceId.HasValue)
        {
            return Result<SurveyLinkDetailsDto>.Failure("Namespace context is required.");
        }

        var userId = _currentUserService.UserId;
        if (!userId.HasValue)
        {
            return Result<SurveyLinkDetailsDto>.Failure("User not authenticated.");
        }

        // Get the survey and verify it belongs to the namespace
        var survey = await _surveyRepository.GetByIdAsync(request.SurveyId, cancellationToken);
        if (survey == null)
        {
            return Result<SurveyLinkDetailsDto>.Failure("Survey not found.");
        }

        if (survey.NamespaceId != namespaceId.Value)
        {
            return Result<SurveyLinkDetailsDto>.Failure(
                "Survey does not belong to this namespace."
            );
        }

        // Get the link
        var link = await _surveyLinkRepository.GetByIdAsync(request.LinkId, cancellationToken);
        if (link == null)
        {
            return Result<SurveyLinkDetailsDto>.Failure("Survey link not found.");
        }

        if (link.SurveyId != request.SurveyId)
        {
            return Result<SurveyLinkDetailsDto>.Failure(
                "Survey link does not belong to this survey."
            );
        }

        var dto = _mapper.Map<SurveyLinkDetailsDto>(link);
        dto.FullUrl = _linkUrlService.BuildLinkUrl(link.Token);

        // Parse prefill data if present
        if (!string.IsNullOrEmpty(link.PrefillDataJson))
        {
            try
            {
                dto.PrefillData = JsonSerializer.Deserialize<Dictionary<string, string>>(
                    link.PrefillDataJson
                );
            }
            catch
            {
                // Ignore deserialization errors
            }
        }

        return Result<SurveyLinkDetailsDto>.Success(dto);
    }
}
