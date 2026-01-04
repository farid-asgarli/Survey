using System.Text.Json;
using AutoMapper;
using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Domain.Entities;
using SurveyApp.Domain.Enums;
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
            return Result<SurveyLinkDto>.Failure("Errors.NamespaceContextRequired");
        }

        var userId = _currentUserService.UserId;
        if (!userId.HasValue)
        {
            return Result<SurveyLinkDto>.Unauthorized("Errors.UserNotAuthenticated");
        }

        // Get the survey and verify it belongs to the namespace
        var survey = await _surveyRepository.GetByIdAsync(request.SurveyId, cancellationToken);
        if (survey == null)
        {
            return Result<SurveyLinkDto>.NotFound("Errors.SurveyNotFound");
        }

        if (survey.NamespaceId != namespaceId.Value)
        {
            return Result<SurveyLinkDto>.Failure("Errors.SurveyNotInNamespace");
        }

        // Verify survey is published before allowing link creation
        if (survey.Status != SurveyStatus.Published)
        {
            return Result<SurveyLinkDto>.Failure("Application.SurveyLink.SurveyMustBePublished");
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

        // MaxUses is optional for non-Unique links (Unique links are enforced by Type in domain)
        // For Unique links, MaxUses is ignored since Type determines single-use behavior
        if (request.Type != SurveyLinkType.Unique && request.MaxUses.HasValue)
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
