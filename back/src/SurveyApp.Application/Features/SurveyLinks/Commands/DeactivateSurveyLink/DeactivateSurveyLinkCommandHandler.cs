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
) : IRequestHandler<DeactivateSurveyLinkCommand, Result<Unit>>
{
    private readonly ISurveyLinkRepository _surveyLinkRepository = surveyLinkRepository;
    private readonly ISurveyRepository _surveyRepository = surveyRepository;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;
    private readonly INamespaceContext _namespaceContext = namespaceContext;
    private readonly ICurrentUserService _currentUserService = currentUserService;

    public async Task<Result<Unit>> Handle(
        DeactivateSurveyLinkCommand request,
        CancellationToken cancellationToken
    )
    {
        var namespaceId = _namespaceContext.CurrentNamespaceId;
        if (!namespaceId.HasValue)
        {
            return Result<Unit>.Failure("Errors.NamespaceContextRequired");
        }

        var userId = _currentUserService.UserId;
        if (!userId.HasValue)
        {
            return Result<Unit>.Unauthorized("Errors.UserNotAuthenticated");
        }

        // Get the survey and verify it belongs to the namespace
        var survey = await _surveyRepository.GetByIdAsync(request.SurveyId, cancellationToken);
        if (survey == null)
        {
            return Result<Unit>.NotFound("Errors.SurveyNotFound");
        }

        if (survey.NamespaceId != namespaceId.Value)
        {
            return Result<Unit>.Failure("Errors.SurveyNotInNamespace");
        }

        // Get the link
        var link = await _surveyLinkRepository.GetByIdAsync(request.LinkId, cancellationToken);
        if (link == null)
        {
            return Result<Unit>.NotFound("Errors.SurveyLinkNotFound");
        }

        if (link.SurveyId != request.SurveyId)
        {
            return Result<Unit>.Failure("Errors.SurveyLinkNotBelongToSurvey");
        }

        link.Deactivate();
        _surveyLinkRepository.Update(link);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<Unit>.Success(Unit.Value);
    }
}
