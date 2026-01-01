using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Domain.Interfaces;

namespace SurveyApp.Application.Features.EmailDistributions.Commands.TrackOpen;

public class TrackOpenCommandHandler(
    IEmailDistributionRepository distributionRepository,
    IUnitOfWork unitOfWork
) : IRequestHandler<TrackOpenCommand, Result<Unit>>
{
    private readonly IEmailDistributionRepository _distributionRepository = distributionRepository;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;

    public async Task<Result<Unit>> Handle(
        TrackOpenCommand request,
        CancellationToken cancellationToken
    )
    {
        if (string.IsNullOrWhiteSpace(request.Token))
        {
            return Result<Unit>.Failure("Errors.InvalidTrackingToken");
        }

        var recipient = await _distributionRepository.GetRecipientByTokenAsync(
            request.Token,
            cancellationToken
        );

        if (recipient == null)
        {
            return Result<Unit>.NotFound("Errors.RecipientNotFound");
        }

        recipient.MarkAsOpened();

        // Update distribution stats
        var distribution = await _distributionRepository.GetByIdAsync(
            recipient.DistributionId,
            cancellationToken
        );

        if (distribution != null)
        {
            distribution.RefreshCounts();
            _distributionRepository.Update(distribution);
        }

        _distributionRepository.UpdateRecipient(recipient);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<Unit>.Success(Unit.Value);
    }
}
