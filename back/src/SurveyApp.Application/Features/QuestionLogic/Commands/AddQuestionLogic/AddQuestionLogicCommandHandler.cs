using AutoMapper;
using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Domain.Enums;
using SurveyApp.Domain.Interfaces;

namespace SurveyApp.Application.Features.QuestionLogic.Commands.AddQuestionLogic;

public class AddQuestionLogicCommandHandler(
    IQuestionLogicRepository questionLogicRepository,
    ISurveyRepository surveyRepository,
    IUnitOfWork unitOfWork,
    INamespaceContext namespaceContext,
    ICurrentUserService currentUserService,
    IMapper mapper
) : IRequestHandler<AddQuestionLogicCommand, Result<QuestionLogicDto>>
{
    private readonly IQuestionLogicRepository _questionLogicRepository = questionLogicRepository;
    private readonly ISurveyRepository _surveyRepository = surveyRepository;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;
    private readonly INamespaceContext _namespaceContext = namespaceContext;
    private readonly ICurrentUserService _currentUserService = currentUserService;
    private readonly IMapper _mapper = mapper;

    public async Task<Result<QuestionLogicDto>> Handle(
        AddQuestionLogicCommand request,
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

        // Verify question exists in survey
        var question = survey.Questions.FirstOrDefault(q => q.Id == request.QuestionId);
        if (question == null)
        {
            return Result<QuestionLogicDto>.Failure("Errors.QuestionNotInSurvey");
        }

        // Verify source question exists in survey
        var sourceQuestion = survey.Questions.FirstOrDefault(q => q.Id == request.SourceQuestionId);
        if (sourceQuestion == null)
        {
            return Result<QuestionLogicDto>.Failure("Errors.SourceQuestionNotInSurvey");
        }

        // Verify target question exists if JumpTo action
        if (request.Action == LogicAction.JumpTo)
        {
            if (!request.TargetQuestionId.HasValue)
            {
                return Result<QuestionLogicDto>.Failure("Validation.TargetQuestionRequired");
            }

            var targetQuestion = survey.Questions.FirstOrDefault(q =>
                q.Id == request.TargetQuestionId.Value
            );
            if (targetQuestion == null)
            {
                return Result<QuestionLogicDto>.Failure("Errors.TargetQuestionNotInSurvey");
            }
        }

        // Get priority (use provided or next available)
        var priority =
            request.Priority
            ?? (
                await _questionLogicRepository.GetMaxPriorityForQuestionAsync(
                    request.QuestionId,
                    cancellationToken
                ) + 1
            );

        // Create question logic
        var questionLogic = Domain.Entities.QuestionLogic.Create(
            request.QuestionId,
            request.SourceQuestionId,
            request.Operator,
            request.ConditionValue,
            request.Action,
            request.TargetQuestionId,
            priority
        );

        _questionLogicRepository.Add(questionLogic);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Map to DTO with question text
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
            TargetQuestionText =
                request.Action == LogicAction.JumpTo
                    ? survey.Questions.FirstOrDefault(q => q.Id == request.TargetQuestionId)?.Text
                    : null,
            Priority = questionLogic.Priority,
        };

        return Result<QuestionLogicDto>.Success(dto);
    }
}
