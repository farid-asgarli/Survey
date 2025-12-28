using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Domain.Interfaces;

namespace SurveyApp.Application.Features.Surveys.Commands.DeleteSurvey;

/// <summary>
/// Handler for deleting a survey.
/// Namespace and permission validation is handled by NamespaceValidationBehavior pipeline.
/// </summary>
public class DeleteSurveyCommandHandler(
    ISurveyRepository surveyRepository,
    IUnitOfWork unitOfWork,
    INamespaceCommandContext commandContext
) : IRequestHandler<DeleteSurveyCommand, Result<bool>>
{
    private readonly ISurveyRepository _surveyRepository = surveyRepository;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;
    private readonly INamespaceCommandContext _commandContext = commandContext;

    public async Task<Result<bool>> Handle(
        DeleteSurveyCommand request,
        CancellationToken cancellationToken
    )
    {
        // Context is validated by NamespaceValidationBehavior pipeline
        var ctx = _commandContext.Context!;

        var survey = await _surveyRepository.GetByIdAsync(request.SurveyId, cancellationToken);
        if (survey == null || survey.NamespaceId != ctx.NamespaceId)
        {
            return Result<bool>.Failure("Survey not found.");
        }

        // Soft delete survey
        _surveyRepository.Delete(survey);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
