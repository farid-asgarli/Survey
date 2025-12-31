using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Domain.Interfaces;

namespace SurveyApp.Application.Features.Responses.Commands.DeleteResponse;

/// <summary>
/// Handler for deleting a response.
/// Namespace and permission validation is handled by NamespaceValidationBehavior pipeline.
/// </summary>
public class DeleteResponseCommandHandler(
    ISurveyResponseRepository responseRepository,
    ISurveyRepository surveyRepository,
    IUnitOfWork unitOfWork,
    INamespaceCommandContext commandContext
) : IRequestHandler<DeleteResponseCommand, Result<bool>>
{
    private readonly ISurveyResponseRepository _responseRepository = responseRepository;
    private readonly ISurveyRepository _surveyRepository = surveyRepository;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;
    private readonly INamespaceCommandContext _commandContext = commandContext;

    public async Task<Result<bool>> Handle(
        DeleteResponseCommand request,
        CancellationToken cancellationToken
    )
    {
        // Context is validated by NamespaceValidationBehavior pipeline
        var ctx = _commandContext.Context!;

        var response = await _responseRepository.GetByIdForUpdateAsync(
            request.ResponseId,
            cancellationToken
        );
        if (response == null)
        {
            return Result<bool>.Failure("Response not found.");
        }

        // Verify the response belongs to a survey in the current namespace
        var survey = await _surveyRepository.GetByIdAsync(response.SurveyId, cancellationToken);
        if (survey == null || survey.NamespaceId != ctx.NamespaceId)
        {
            return Result<bool>.Failure("Response not found.");
        }

        _responseRepository.Delete(response);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
