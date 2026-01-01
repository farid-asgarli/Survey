using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Domain.Interfaces;

namespace SurveyApp.Application.Features.Responses.Commands.BulkDeleteResponses;

/// <summary>
/// Handler for bulk deleting responses atomically.
/// Namespace and permission validation is handled by NamespaceValidationBehavior pipeline.
/// </summary>
public class BulkDeleteResponsesCommandHandler(
    ISurveyResponseRepository responseRepository,
    ISurveyRepository surveyRepository,
    IUnitOfWork unitOfWork,
    INamespaceCommandContext commandContext
) : IRequestHandler<BulkDeleteResponsesCommand, Result<BulkDeleteResponsesResult>>
{
    private readonly ISurveyResponseRepository _responseRepository = responseRepository;
    private readonly ISurveyRepository _surveyRepository = surveyRepository;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;
    private readonly INamespaceCommandContext _commandContext = commandContext;

    public async Task<Result<BulkDeleteResponsesResult>> Handle(
        BulkDeleteResponsesCommand request,
        CancellationToken cancellationToken
    )
    {
        // Context is validated by NamespaceValidationBehavior pipeline
        var ctx = _commandContext.Context!;

        if (request.ResponseIds.Count == 0)
        {
            return Result<BulkDeleteResponsesResult>.Failure("Errors.AtLeastOneResponseIdRequired");
        }

        // Verify the survey exists and belongs to the current namespace
        var survey = await _surveyRepository.GetByIdAsync(request.SurveyId, cancellationToken);
        if (survey == null || survey.NamespaceId != ctx.NamespaceId)
        {
            return Result<BulkDeleteResponsesResult>.NotFound("Errors.SurveyNotFound");
        }

        var deletedCount = 0;
        var failedIds = new List<Guid>();

        foreach (var responseId in request.ResponseIds)
        {
            var response = await _responseRepository.GetByIdForUpdateAsync(
                responseId,
                cancellationToken
            );

            if (response == null || response.SurveyId != request.SurveyId)
            {
                failedIds.Add(responseId);
                continue;
            }

            _responseRepository.Delete(response);
            deletedCount++;
        }

        // Save all changes atomically
        if (deletedCount > 0)
        {
            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }

        var result = new BulkDeleteResponsesResult
        {
            DeletedCount = deletedCount,
            FailedIds = failedIds,
        };

        // Return success even with partial failures, let the caller decide how to handle
        return Result<BulkDeleteResponsesResult>.Success(result);
    }
}
