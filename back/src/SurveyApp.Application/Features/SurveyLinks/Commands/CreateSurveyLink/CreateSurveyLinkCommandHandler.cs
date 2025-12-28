using System.Text.Json;
using AutoMapper;
using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Domain.Entities;
using SurveyApp.Domain.Interfaces;

namespace SurveyApp.Application.Features.SurveyLinks.Commands.CreateSurveyLink;

/// <summary>
/// Handler for creating a new survey link.
/// </summary>
public class CreateSurveyLinkCommandHandler(
    ISurveyLinkRepository surveyLinkRepository,
    ISurveyRepository surveyRepository,
    IUnitOfWork unitOfWork,
    INamespaceContext namespaceContext,
    ICurrentUserService currentUserService,
    ILinkUrlService linkUrlService,
    IMapper mapper
) : IRequestHandler<CreateSurveyLinkCommand, Result<SurveyLinkDto>>
{
    private readonly ISurveyLinkRepository _surveyLinkRepository = surveyLinkRepository;
    private readonly ISurveyRepository _surveyRepository = surveyRepository;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;
    private readonly INamespaceContext _namespaceContext = namespaceContext;
    private readonly ICurrentUserService _currentUserService = currentUserService;
    private readonly ILinkUrlService _linkUrlService = linkUrlService;
    private readonly IMapper _mapper = mapper;

    public async Task<Result<SurveyLinkDto>> Handle(
        CreateSurveyLinkCommand request,
        CancellationToken cancellationToken
    )
    {
        var namespaceId = _namespaceContext.CurrentNamespaceId;
        if (!namespaceId.HasValue)
        {
            return Result<SurveyLinkDto>.Failure("Handler.NamespaceContextRequired");
        }

        var userId = _currentUserService.UserId;
        if (!userId.HasValue)
        {
            return Result<SurveyLinkDto>.Failure("User not authenticated.");
        }

        // Get the survey and verify it belongs to the namespace
        var survey = await _surveyRepository.GetByIdAsync(request.SurveyId, cancellationToken);
        if (survey == null)
        {
            return Result<SurveyLinkDto>.Failure("Handler.SurveyNotFound");
        }

        if (survey.NamespaceId != namespaceId.Value)
        {
            return Result<SurveyLinkDto>.Failure("Survey does not belong to this namespace.");
        }

        // Create the link
        var link = SurveyLink.Create(
            request.SurveyId,
            request.Type,
            request.Name,
            request.Source,
            request.Medium,
            request.Campaign
        );

        // Set optional properties
        if (request.PrefillData != null && request.PrefillData.Count > 0)
        {
            link.SetPrefillData(JsonSerializer.Serialize(request.PrefillData));
        }

        if (request.ExpiresAt.HasValue)
        {
            link.SetExpiration(request.ExpiresAt.Value);
        }

        if (request.MaxUses.HasValue)
        {
            link.SetMaxUses(request.MaxUses.Value);
        }

        if (!string.IsNullOrEmpty(request.Password))
        {
            link.SetPassword(request.Password);
        }

        await _surveyLinkRepository.AddAsync(link, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = _mapper.Map<SurveyLinkDto>(link);
        dto.FullUrl = _linkUrlService.BuildLinkUrl(link.Token);

        return Result<SurveyLinkDto>.Success(dto);
    }
}
