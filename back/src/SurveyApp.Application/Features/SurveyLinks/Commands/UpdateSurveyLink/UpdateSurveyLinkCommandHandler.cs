using System.Text.Json;
using AutoMapper;
using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Domain.Interfaces;

namespace SurveyApp.Application.Features.SurveyLinks.Commands.UpdateSurveyLink;

/// <summary>
/// Handler for updating a survey link.
/// </summary>
public class UpdateSurveyLinkCommandHandler(
    ISurveyLinkRepository surveyLinkRepository,
    ISurveyRepository surveyRepository,
    IUnitOfWork unitOfWork,
    INamespaceContext namespaceContext,
    ICurrentUserService currentUserService,
    ILinkUrlService linkUrlService,
    IMapper mapper
) : IRequestHandler<UpdateSurveyLinkCommand, Result<SurveyLinkDto>>
{
    private readonly ISurveyLinkRepository _surveyLinkRepository = surveyLinkRepository;
    private readonly ISurveyRepository _surveyRepository = surveyRepository;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;
    private readonly INamespaceContext _namespaceContext = namespaceContext;
    private readonly ICurrentUserService _currentUserService = currentUserService;
    private readonly ILinkUrlService _linkUrlService = linkUrlService;
    private readonly IMapper _mapper = mapper;

    public async Task<Result<SurveyLinkDto>> Handle(
        UpdateSurveyLinkCommand request,
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

        // Get the link
        var link = await _surveyLinkRepository.GetByIdAsync(request.LinkId, cancellationToken);
        if (link == null)
        {
            return Result<SurveyLinkDto>.Failure("Survey link not found.");
        }

        if (link.SurveyId != request.SurveyId)
        {
            return Result<SurveyLinkDto>.Failure("Survey link does not belong to this survey.");
        }

        // Update properties
        link.UpdateName(request.Name);
        link.UpdateTracking(request.Source, request.Medium, request.Campaign);

        if (request.PrefillData != null)
        {
            link.SetPrefillData(
                request.PrefillData.Count > 0 ? JsonSerializer.Serialize(request.PrefillData) : null
            );
        }

        link.SetExpiration(request.ExpiresAt);

        if (request.MaxUses.HasValue)
        {
            link.SetMaxUses(request.MaxUses.Value);
        }

        if (request.Password != null)
        {
            link.SetPassword(string.IsNullOrEmpty(request.Password) ? null : request.Password);
        }

        if (request.IsActive.HasValue)
        {
            if (request.IsActive.Value)
                link.Activate();
            else
                link.Deactivate();
        }

        _surveyLinkRepository.Update(link);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = _mapper.Map<SurveyLinkDto>(link);
        dto.FullUrl = _linkUrlService.BuildLinkUrl(link.Token);

        return Result<SurveyLinkDto>.Success(dto);
    }
}
