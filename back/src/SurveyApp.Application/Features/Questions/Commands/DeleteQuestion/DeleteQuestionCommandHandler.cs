using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Domain.Enums;
using SurveyApp.Domain.Interfaces;

namespace SurveyApp.Application.Features.Questions.Commands.DeleteQuestion;

/// <summary>
/// Handler for deleting a question from a survey.
/// Namespace and permission validation is handled by NamespaceValidationBehavior pipeline.
/// </summary>
public class DeleteQuestionCommandHandler(
    ISurveyRepository surveyRepository,
    IUnitOfWork unitOfWork,
    INamespaceCommandContext commandContext
) : IRequestHandler<DeleteQuestionCommand, Result<Unit>>
{
    private readonly ISurveyRepository _surveyRepository = surveyRepository;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;
    private readonly INamespaceCommandContext _commandContext = commandContext;

    public async Task<Result<Unit>> Handle(
        DeleteQuestionCommand request,
        CancellationToken cancellationToken
    )
    {
        // Context is validated by NamespaceValidationBehavior pipeline
        var ctx = _commandContext.Context!;

        var survey = await _surveyRepository.GetByIdWithQuestionsForUpdateAsync(
            request.SurveyId,
            cancellationToken
        );
        if (survey == null || survey.NamespaceId != ctx.NamespaceId)
        {
            return Result<Unit>.Failure("Errors.SurveyNotFound");
        }

        // Check if survey can be edited
        if (survey.Status != SurveyStatus.Draft)
        {
            return Result<Unit>.Failure("Errors.OnlyDraftSurveysEditable");
        }

        var question = survey.Questions.FirstOrDefault(q => q.Id == request.QuestionId);
        if (question == null)
        {
            return Result<Unit>.Failure("Errors.QuestionNotFound");
        }

        survey.RemoveQuestion(request.QuestionId);

        _surveyRepository.Update(survey);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<Unit>.Success(Unit.Value);
    }
}
