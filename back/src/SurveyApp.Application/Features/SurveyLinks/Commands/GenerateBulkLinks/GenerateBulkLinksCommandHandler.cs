using AutoMapper;
using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Domain.Entities;
using SurveyApp.Domain.Enums;
using SurveyApp.Domain.Interfaces;

namespace SurveyApp.Application.Features.SurveyLinks.Commands.GenerateBulkLinks;

/// <summary>
/// Handler for generating multiple survey links at once.
/// </summary>
public class GenerateBulkLinksCommandHandler(
    ISurveyLinkRepository surveyLinkRepository,
    ISurveyRepository surveyRepository,
    IUnitOfWork unitOfWork,
    INamespaceContext namespaceContext,
    ICurrentUserService currentUserService,
    ILinkUrlService linkUrlService,
    IMapper mapper
) : IRequestHandler<GenerateBulkLinksCommand, Result<BulkLinkGenerationResultDto>>
{
    private readonly ISurveyLinkRepository _surveyLinkRepository = surveyLinkRepository;
    private readonly ISurveyRepository _surveyRepository = surveyRepository;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;
    private readonly INamespaceContext _namespaceContext = namespaceContext;
    private readonly ICurrentUserService _currentUserService = currentUserService;
    private readonly ILinkUrlService _linkUrlService = linkUrlService;
    private readonly IMapper _mapper = mapper;

    private const int MaxBulkLinks = 1000;

    public async Task<Result<BulkLinkGenerationResultDto>> Handle(
        GenerateBulkLinksCommand request,
        CancellationToken cancellationToken
    )
    {
        var namespaceId = _namespaceContext.CurrentNamespaceId;
        if (!namespaceId.HasValue)
        {
            return Result<BulkLinkGenerationResultDto>.Failure("Handler.NamespaceContextRequired");
        }

        var userId = _currentUserService.UserId;
        if (!userId.HasValue)
        {
            return Result<BulkLinkGenerationResultDto>.Failure("User not authenticated.");
        }

        if (request.Count <= 0)
        {
            return Result<BulkLinkGenerationResultDto>.Failure("Count must be greater than 0.");
        }

        if (request.Count > MaxBulkLinks)
        {
            return Result<BulkLinkGenerationResultDto>.Failure(
                $"Cannot generate more than {MaxBulkLinks} links at once."
            );
        }

        // Get the survey and verify it belongs to the namespace
        var survey = await _surveyRepository.GetByIdAsync(request.SurveyId, cancellationToken);
        if (survey == null)
        {
            return Result<BulkLinkGenerationResultDto>.Failure("Handler.SurveyNotFound");
        }

        if (survey.NamespaceId != namespaceId.Value)
        {
            return Result<BulkLinkGenerationResultDto>.Failure(
                "Survey does not belong to this namespace."
            );
        }

        var links = new List<SurveyLink>();

        for (int i = 1; i <= request.Count; i++)
        {
            var name = string.IsNullOrEmpty(request.NamePrefix)
                ? $"Link {i}"
                : $"{request.NamePrefix} {i}";

            var link = SurveyLink.Create(
                request.SurveyId,
                SurveyLinkType.Unique,
                name,
                request.Source,
                request.Medium,
                request.Campaign
            );

            if (request.ExpiresAt.HasValue)
            {
                link.SetExpiration(request.ExpiresAt.Value);
            }

            // Unique links can only be used once
            link.SetMaxUses(1);

            links.Add(link);
        }

        await _surveyLinkRepository.AddRangeAsync(links, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var linkDtos = links
            .Select(l =>
            {
                var dto = _mapper.Map<SurveyLinkDto>(l);
                dto.FullUrl = _linkUrlService.BuildLinkUrl(l.Token);
                return dto;
            })
            .ToList();

        return Result<BulkLinkGenerationResultDto>.Success(
            new BulkLinkGenerationResultDto
            {
                RequestedCount = request.Count,
                GeneratedCount = linkDtos.Count,
                Links = linkDtos,
            }
        );
    }
}
