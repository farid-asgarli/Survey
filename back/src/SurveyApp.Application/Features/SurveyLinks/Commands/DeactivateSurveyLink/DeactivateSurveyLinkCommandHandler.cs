using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Domain.Interfaces;

namespace SurveyApp.Application.Features.SurveyLinks.Commands.DeactivateSurveyLink;

/// <summary>
/// Handler for deactivating a survey link.
/// </summary>
public class DeactivateSurveyLinkCommandHandler(
    ISurveyLinkRepository surveyLinkRepository,
    ISurveyRepository surveyRepository,
    IUnitOfWork unitOfWork,
    INamespaceContext namespaceContext,
    ICurrentUserService currentUserService
) : IRequestHandler<DeactivateSurveyLinkCommand, Result<bool>>
{
    private readonly ISurveyLinkRepository _surveyLinkRepository = surveyLinkRepository;
    private readonly ISurveyRepository _surveyRepository = surveyRepository;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;
    private readonly INamespaceContext _namespaceContext = namespaceContext;
    private readonly ICurrentUserService _currentUserService = currentUserService;

    public async Task<Result<bool>> Handle(
        DeactivateSurveyLinkCommand request,
        CancellationToken cancellationToken
    )
    {
        var namespaceId = _namespaceContext.CurrentNamespaceId;
        if (!namespaceId.HasValue)
        {
            return Result<bool>.Failure("Handler.NamespaceContextRequired");
        }

        var userId = _currentUserService.UserId;
        if (!userId.HasValue)
        {
            return Result<bool>.Failure("User not authenticated.");
        }

        // Get the survey and verify it belongs to the namespace
        var survey = await _surveyRepository.GetByIdAsync(request.SurveyId, cancellationToken);
        if (survey == null)
        {
            return Result<bool>.Failure("Handler.SurveyNotFound");
        }

        if (survey.NamespaceId != namespaceId.Value)
        {
            return Result<bool>.Failure("Survey does not belong to this namespace.");
        }

        // Get the link
        var link = await _surveyLinkRepository.GetByIdAsync(request.LinkId, cancellationToken);
        if (link == null)
        {
            return Result<bool>.Failure("Survey link not found.");
        }

        if (link.SurveyId != request.SurveyId)
        {
            return Result<bool>.Failure("Survey link does not belong to this survey.");
        }

        link.Deactivate();
        _surveyLinkRepository.Update(link);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
