using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Domain.Interfaces;

namespace SurveyApp.Application.Features.EmailDistributions.Commands.TrackClick;

public class TrackClickCommandHandler(
    IEmailDistributionRepository distributionRepository,
    ISurveyRepository surveyRepository,
    IUnitOfWork unitOfWork
) : IRequestHandler<TrackClickCommand, Result<string?>>
{
    private readonly IEmailDistributionRepository _distributionRepository = distributionRepository;
    private readonly ISurveyRepository _surveyRepository = surveyRepository;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;

    public async Task<Result<string?>> Handle(
        TrackClickCommand request,
        CancellationToken cancellationToken
    )
    {
        if (string.IsNullOrWhiteSpace(request.Token))
        {
            return Result<string?>.Failure("Errors.InvalidTrackingToken");
        }

        var recipient = await _distributionRepository.GetRecipientByTokenAsync(
            request.Token,
            cancellationToken
        );

        if (recipient == null)
        {
            return Result<string?>.NotFound("Errors.RecipientNotFound");
        }

        recipient.MarkAsClicked();

        // Update distribution stats
        var distribution = await _distributionRepository.GetByIdAsync(
            recipient.DistributionId,
            cancellationToken
        );

        if (distribution == null)
        {
            return Result<string?>.NotFound("Errors.DistributionNotFound");
        }

        distribution.RefreshCounts();
        _distributionRepository.Update(distribution);
        _distributionRepository.UpdateRecipient(recipient);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Get survey access token for redirect
        var survey = await _surveyRepository.GetByIdAsync(distribution.SurveyId, cancellationToken);
        var surveyAccessToken = survey?.AccessToken;

        return Result<string?>.Success(surveyAccessToken);
    }
}
