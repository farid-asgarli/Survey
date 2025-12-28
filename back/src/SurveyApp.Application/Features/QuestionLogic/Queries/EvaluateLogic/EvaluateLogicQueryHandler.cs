using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.DTOs;
using SurveyApp.Application.Services;
using SurveyApp.Domain.Interfaces;

namespace SurveyApp.Application.Features.QuestionLogic.Queries.EvaluateLogic;

public class EvaluateLogicQueryHandler(
    IQuestionLogicRepository questionLogicRepository,
    ISurveyRepository surveyRepository,
    ILogicEvaluationService logicEvaluationService
) : IRequestHandler<EvaluateLogicQuery, Result<LogicEvaluationResultDto>>
{
    private readonly IQuestionLogicRepository _questionLogicRepository = questionLogicRepository;
    private readonly ISurveyRepository _surveyRepository = surveyRepository;
    private readonly ILogicEvaluationService _logicEvaluationService = logicEvaluationService;

    public async Task<Result<LogicEvaluationResultDto>> Handle(
        EvaluateLogicQuery request,
        CancellationToken cancellationToken
    )
    {
        // Get survey with questions
        var survey = await _surveyRepository.GetByIdWithQuestionsAsync(
            request.SurveyId,
            cancellationToken
        );
        if (survey == null)
        {
            return Result<LogicEvaluationResultDto>.Failure("Handler.SurveyNotFound");
        }

        // Get all logic rules for the survey
        var logicRules = await _questionLogicRepository.GetBySurveyIdAsync(
            request.SurveyId,
            cancellationToken
        );

        // Convert answers to dictionary
        var answersDictionary = request.Answers.ToDictionary(
            a => a.QuestionId,
            a => (string?)a.Value
        );

        // Get visible questions
        var visibleQuestionIds = _logicEvaluationService.GetVisibleQuestions(
            survey,
            logicRules,
            answersDictionary
        );

        // Get all question IDs
        var allQuestionIds = survey.Questions.Select(q => q.Id).ToHashSet();
        var hiddenQuestionIds = allQuestionIds.Except(visibleQuestionIds).ToList();

        // Check if survey should end
        var shouldEndSurvey = _logicEvaluationService.ShouldEndSurvey(
            logicRules,
            answersDictionary
        );

        // Determine next question if current is provided
        Guid? nextQuestionId = null;
        if (request.CurrentQuestionId.HasValue && !shouldEndSurvey)
        {
            var currentQuestion = survey.Questions.FirstOrDefault(q =>
                q.Id == request.CurrentQuestionId.Value
            );
            if (currentQuestion != null)
            {
                nextQuestionId = _logicEvaluationService.GetNextQuestion(
                    survey,
                    logicRules,
                    currentQuestion,
                    answersDictionary
                );
            }
        }

        var result = new LogicEvaluationResultDto
        {
            VisibleQuestionIds = visibleQuestionIds.ToList(),
            HiddenQuestionIds = hiddenQuestionIds,
            NextQuestionId = nextQuestionId,
            ShouldEndSurvey = shouldEndSurvey,
        };

        return Result<LogicEvaluationResultDto>.Success(result);
    }
}
