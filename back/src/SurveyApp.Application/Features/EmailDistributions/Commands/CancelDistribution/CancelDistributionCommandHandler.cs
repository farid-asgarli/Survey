using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Domain.Enums;
using SurveyApp.Domain.Interfaces;

namespace SurveyApp.Application.Features.EmailDistributions.Commands.CancelDistribution;

public class CancelDistributionCommandHandler(
    IEmailDistributionRepository distributionRepository,
    IUnitOfWork unitOfWork,
    INamespaceContext namespaceContext,
    ICurrentUserService currentUserService
) : IRequestHandler<CancelDistributionCommand, Result<Unit>>
{
    private readonly IEmailDistributionRepository _distributionRepository = distributionRepository;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;
    private readonly INamespaceContext _namespaceContext = namespaceContext;
    private readonly ICurrentUserService _currentUserService = currentUserService;

    /// <summary>
    /// Statuses that allow distribution cancellation.
    /// Only Draft and Scheduled distributions can be cancelled.
    /// </summary>
    private static readonly DistributionStatus[] CancellableStatuses =
    [
        DistributionStatus.Draft,
        DistributionStatus.Scheduled,
    ];

    public async Task<Result<Unit>> Handle(
        CancelDistributionCommand request,
        CancellationToken cancellationToken
    )
    {
        var namespaceId = _namespaceContext.CurrentNamespaceId;
        if (!namespaceId.HasValue)
        {
            return Result<Unit>.Failure("Errors.NamespaceRequired");
        }

        var userId = _currentUserService.UserId;
        if (!userId.HasValue)
        {
            return Result<Unit>.Unauthorized("Errors.UserNotAuthenticated");
        }

        // Get distribution
        var distribution = await _distributionRepository.GetByIdAsync(
            request.DistributionId,
            cancellationToken
        );

        if (
            distribution == null
            || distribution.NamespaceId != namespaceId.Value
            || distribution.SurveyId != request.SurveyId
        )
        {
            return Result<Unit>.NotFound("Errors.DistributionNotFound");
        }

        // Validate status - return localized error key instead of domain exception
        if (!CancellableStatuses.Contains(distribution.Status))
        {
            return Result<Unit>.Failure("Errors.CannotCancelDistribution");
        }

        distribution.Cancel();

        _distributionRepository.Update(distribution);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<Unit>.Success(Unit.Value);
    }
}
