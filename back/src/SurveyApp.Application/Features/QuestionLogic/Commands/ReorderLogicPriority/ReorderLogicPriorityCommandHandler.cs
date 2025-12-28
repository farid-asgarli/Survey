using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Domain.Interfaces;

namespace SurveyApp.Application.Features.QuestionLogic.Commands.ReorderLogicPriority;

public class ReorderLogicPriorityCommandHandler(
    IQuestionLogicRepository questionLogicRepository,
    ISurveyRepository surveyRepository,
    IUnitOfWork unitOfWork,
    INamespaceContext namespaceContext,
    ICurrentUserService currentUserService
) : IRequestHandler<ReorderLogicPriorityCommand, Result<bool>>
{
    private readonly IQuestionLogicRepository _questionLogicRepository = questionLogicRepository;
    private readonly ISurveyRepository _surveyRepository = surveyRepository;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;
    private readonly INamespaceContext _namespaceContext = namespaceContext;
    private readonly ICurrentUserService _currentUserService = currentUserService;

    public async Task<Result<bool>> Handle(
        ReorderLogicPriorityCommand request,
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

        // Get all logic for the question
        var existingLogics = await _questionLogicRepository.GetByQuestionIdAsync(
            request.QuestionId,
            cancellationToken
        );

        // Verify all provided IDs exist
        var existingIds = existingLogics.Select(l => l.Id).ToHashSet();
        var providedIds = request.LogicIds.ToHashSet();

        if (!providedIds.SetEquals(existingIds))
        {
            return Result<bool>.Failure("Errors.LogicIdsMismatch");
        }

        // Update priorities
        for (int i = 0; i < request.LogicIds.Count; i++)
        {
            var logic = existingLogics.First(l => l.Id == request.LogicIds[i]);
            logic.UpdatePriority(i);
            _questionLogicRepository.Update(logic);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
