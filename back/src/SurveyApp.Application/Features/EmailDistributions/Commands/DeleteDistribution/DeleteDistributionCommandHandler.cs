using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Domain.Interfaces;

namespace SurveyApp.Application.Features.EmailDistributions.Commands.DeleteDistribution;

public class DeleteDistributionCommandHandler(
    IEmailDistributionRepository distributionRepository,
    IUnitOfWork unitOfWork,
    INamespaceContext namespaceContext,
    ICurrentUserService currentUserService
) : IRequestHandler<DeleteDistributionCommand, Result<bool>>
{
    private readonly IEmailDistributionRepository _distributionRepository = distributionRepository;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;
    private readonly INamespaceContext _namespaceContext = namespaceContext;
    private readonly ICurrentUserService _currentUserService = currentUserService;

    public async Task<Result<bool>> Handle(
        DeleteDistributionCommand request,
        CancellationToken cancellationToken
    )
    {
        var namespaceId = _namespaceContext.CurrentNamespaceId;
        if (!namespaceId.HasValue)
        {
            return Result<bool>.Failure("Errors.NamespaceRequired");
        }

        var userId = _currentUserService.UserId;
        if (!userId.HasValue)
        {
            return Result<bool>.Failure("Errors.UserNotAuthenticated");
        }

        // Get distribution
        var distribution = await _distributionRepository.GetByIdAsync(
            request.DistributionId,
            cancellationToken
        );

        if (distribution == null || distribution.NamespaceId != namespaceId.Value)
        {
            return Result<bool>.Failure("Errors.DistributionNotFound");
        }

        _distributionRepository.Delete(distribution);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
