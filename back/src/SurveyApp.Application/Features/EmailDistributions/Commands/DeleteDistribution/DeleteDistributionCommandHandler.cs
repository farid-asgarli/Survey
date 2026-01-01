using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Domain.Enums;
using SurveyApp.Domain.Interfaces;

namespace SurveyApp.Application.Features.EmailDistributions.Commands.DeleteDistribution;

public class DeleteDistributionCommandHandler(
    IEmailDistributionRepository distributionRepository,
    IUnitOfWork unitOfWork,
    INamespaceContext namespaceContext,
    ICurrentUserService currentUserService
) : IRequestHandler<DeleteDistributionCommand, Result<Unit>>
{
    private readonly IEmailDistributionRepository _distributionRepository = distributionRepository;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;
    private readonly INamespaceContext _namespaceContext = namespaceContext;
    private readonly ICurrentUserService _currentUserService = currentUserService;

    /// <summary>
    /// Statuses that allow distribution deletion.
    /// Distributions that are actively sending or have been sent cannot be deleted
    /// to preserve tracking data and audit trails.
    /// </summary>
    private static readonly DistributionStatus[] DeletableStatuses =
    [
        DistributionStatus.Draft,
        DistributionStatus.Scheduled,
        DistributionStatus.Cancelled,
        DistributionStatus.Failed,
    ];

    public async Task<Result<Unit>> Handle(
        DeleteDistributionCommand request,
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

        // Get distribution with change tracking for delete
        var distribution = await _distributionRepository.GetByIdForUpdateAsync(
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

        // Validate status - prevent deletion of sent/sending distributions
        if (!DeletableStatuses.Contains(distribution.Status))
        {
            return Result<Unit>.Failure("Errors.CannotDeleteDistribution");
        }

        _distributionRepository.Delete(distribution);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<Unit>.Success(Unit.Value);
    }
}
