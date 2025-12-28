using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Domain.Interfaces;

namespace SurveyApp.Application.Features.QuestionLogic.Commands.RemoveQuestionLogic;

public class RemoveQuestionLogicCommandHandler(
    IQuestionLogicRepository questionLogicRepository,
    ISurveyRepository surveyRepository,
    IUnitOfWork unitOfWork,
    INamespaceContext namespaceContext,
    ICurrentUserService currentUserService
) : IRequestHandler<RemoveQuestionLogicCommand, Result<bool>>
{
    private readonly IQuestionLogicRepository _questionLogicRepository = questionLogicRepository;
    private readonly ISurveyRepository _surveyRepository = surveyRepository;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;
    private readonly INamespaceContext _namespaceContext = namespaceContext;
    private readonly ICurrentUserService _currentUserService = currentUserService;

    public async Task<Result<bool>> Handle(
        RemoveQuestionLogicCommand request,
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

        // Get survey
        var survey = await _surveyRepository.GetByIdAsync(request.SurveyId, cancellationToken);
        if (survey == null)
        {
            return Result<bool>.Failure("Errors.SurveyNotFound");
        }

        // Verify survey belongs to namespace
        if (survey.NamespaceId != namespaceId.Value)
        {
            return Result<bool>.Failure("Errors.SurveyNotInNamespace");
        }

        // Get existing logic
        var questionLogic = await _questionLogicRepository.GetByIdAsync(
            request.LogicId,
            cancellationToken
        );
        if (questionLogic == null)
        {
            return Result<bool>.Failure("Errors.QuestionLogicNotFound");
        }

        // Verify logic belongs to the question
        if (questionLogic.QuestionId != request.QuestionId)
        {
            return Result<bool>.Failure("Errors.LogicNotBelongToQuestion");
        }

        _questionLogicRepository.Remove(questionLogic);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
