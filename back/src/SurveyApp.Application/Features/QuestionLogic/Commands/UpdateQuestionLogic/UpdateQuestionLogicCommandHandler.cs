using AutoMapper;
using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Domain.Enums;
using SurveyApp.Domain.Interfaces;

namespace SurveyApp.Application.Features.QuestionLogic.Commands.UpdateQuestionLogic;

public class UpdateQuestionLogicCommandHandler(
    IQuestionLogicRepository questionLogicRepository,
    ISurveyRepository surveyRepository,
    IUnitOfWork unitOfWork,
    INamespaceContext namespaceContext,
    ICurrentUserService currentUserService,
    IMapper mapper
) : IRequestHandler<UpdateQuestionLogicCommand, Result<QuestionLogicDto>>
{
    private readonly IQuestionLogicRepository _questionLogicRepository = questionLogicRepository;
    private readonly ISurveyRepository _surveyRepository = surveyRepository;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;
    private readonly INamespaceContext _namespaceContext = namespaceContext;
    private readonly ICurrentUserService _currentUserService = currentUserService;
    private readonly IMapper _mapper = mapper;

    public async Task<Result<QuestionLogicDto>> Handle(
        UpdateQuestionLogicCommand request,
        CancellationToken cancellationToken
    )
    {
        var namespaceId = _namespaceContext.CurrentNamespaceId;
        if (!namespaceId.HasValue)
        {
            return Result<QuestionLogicDto>.Failure("Errors.NamespaceRequired");
        }

        var userId = _currentUserService.UserId;
        if (!userId.HasValue)
        {
            return Result<QuestionLogicDto>.Unauthorized("Errors.UserNotAuthenticated");
        }

        // Get survey with questions
        var survey = await _surveyRepository.GetByIdWithQuestionsAsync(
            request.SurveyId,
            cancellationToken
        );
        if (survey == null)
        {
            return Result<QuestionLogicDto>.NotFound("Errors.SurveyNotFound");
        }

        // Verify survey belongs to namespace
        if (survey.NamespaceId != namespaceId.Value)
        {
            return Result<QuestionLogicDto>.Failure("Errors.SurveyNotInNamespace");
        }

        // Get existing logic with change tracking for updates
        var questionLogic = await _questionLogicRepository.GetByIdForUpdateAsync(
            request.LogicId,
            cancellationToken
        );
        if (questionLogic == null)
        {
            return Result<QuestionLogicDto>.NotFound("Errors.QuestionLogicNotFound");
        }

        // Verify logic belongs to the question
        if (questionLogic.QuestionId != request.QuestionId)
        {
            return Result<QuestionLogicDto>.Failure("Errors.LogicNotBelongToQuestion");
        }

        // Verify source question exists in survey
        var sourceQuestion = survey.Questions.FirstOrDefault(q => q.Id == request.SourceQuestionId);
        if (sourceQuestion == null)
        {
            return Result<QuestionLogicDto>.Failure("Errors.SourceQuestionNotInSurvey");
        }

        // Verify target question exists if JumpTo action
        Domain.Entities.Question? targetQuestion = null;
        if (request.Action == LogicAction.JumpTo)
        {
            if (!request.TargetQuestionId.HasValue)
            {
                return Result<QuestionLogicDto>.Failure("Validation.TargetQuestionRequired");
            }

            targetQuestion = survey.Questions.FirstOrDefault(q =>
                q.Id == request.TargetQuestionId.Value
            );
            if (targetQuestion == null)
            {
                return Result<QuestionLogicDto>.Failure("Errors.TargetQuestionNotInSurvey");
            }
        }

        // Update logic
        questionLogic.Update(
            request.SourceQuestionId,
            request.Operator,
            request.ConditionValue,
            request.Action,
            request.TargetQuestionId,
            request.Priority
        );

        _questionLogicRepository.Update(questionLogic);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Map to DTO
        var dto = new QuestionLogicDto
        {
            Id = questionLogic.Id,
            QuestionId = questionLogic.QuestionId,
            SourceQuestionId = questionLogic.SourceQuestionId,
            SourceQuestionText = sourceQuestion.Text,
            Operator = questionLogic.Operator,
            ConditionValue = questionLogic.ConditionValue,
            Action = questionLogic.Action,
            TargetQuestionId = questionLogic.TargetQuestionId,
            TargetQuestionText = targetQuestion?.Text,
            Priority = questionLogic.Priority,
        };

        return Result<QuestionLogicDto>.Success(dto);
    }
}
