using AutoMapper;
using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Domain.Interfaces;

namespace SurveyApp.Application.Features.QuestionLogic.Queries.GetQuestionLogic;

public class GetQuestionLogicQueryHandler(
    IQuestionLogicRepository questionLogicRepository,
    ISurveyRepository surveyRepository,
    INamespaceContext namespaceContext,
    IMapper mapper
) : IRequestHandler<GetQuestionLogicQuery, Result<IReadOnlyList<QuestionLogicDto>>>
{
    private readonly IQuestionLogicRepository _questionLogicRepository = questionLogicRepository;
    private readonly ISurveyRepository _surveyRepository = surveyRepository;
    private readonly INamespaceContext _namespaceContext = namespaceContext;
    private readonly IMapper _mapper = mapper;

    public async Task<Result<IReadOnlyList<QuestionLogicDto>>> Handle(
        GetQuestionLogicQuery request,
        CancellationToken cancellationToken
    )
    {
        var namespaceId = _namespaceContext.CurrentNamespaceId;
        if (!namespaceId.HasValue)
        {
            return Result<IReadOnlyList<QuestionLogicDto>>.Failure(
                "Handler.NamespaceContextRequired"
            );
        }

        // Get survey
        var survey = await _surveyRepository.GetByIdWithQuestionsAsync(
            request.SurveyId,
            cancellationToken
        );
        if (survey == null)
        {
            return Result<IReadOnlyList<QuestionLogicDto>>.Failure("Handler.SurveyNotFound");
        }

        // Verify survey belongs to namespace
        if (survey.NamespaceId != namespaceId.Value)
        {
            return Result<IReadOnlyList<QuestionLogicDto>>.Failure("Errors.SurveyNotInNamespace");
        }

        // Verify question exists in survey
        var question = survey.Questions.FirstOrDefault(q => q.Id == request.QuestionId);
        if (question == null)
        {
            return Result<IReadOnlyList<QuestionLogicDto>>.Failure("Errors.QuestionNotInSurvey");
        }

        // Get logic rules
        var logicRules = await _questionLogicRepository.GetByQuestionIdAsync(
            request.QuestionId,
            cancellationToken
        );

        // Map to DTOs
        var dtos = logicRules
            .Select(l => new QuestionLogicDto
            {
                Id = l.Id,
                QuestionId = l.QuestionId,
                SourceQuestionId = l.SourceQuestionId,
                SourceQuestionText =
                    l.SourceQuestion?.Text
                    ?? survey.Questions.FirstOrDefault(q => q.Id == l.SourceQuestionId)?.Text
                    ?? string.Empty,
                Operator = l.Operator,
                ConditionValue = l.ConditionValue,
                Action = l.Action,
                TargetQuestionId = l.TargetQuestionId,
                TargetQuestionText = l.TargetQuestionId.HasValue
                    ? (
                        l.TargetQuestion?.Text
                        ?? survey.Questions.FirstOrDefault(q => q.Id == l.TargetQuestionId)?.Text
                    )
                    : null,
                Priority = l.Priority,
            })
            .ToList();

        return Result<IReadOnlyList<QuestionLogicDto>>.Success(dtos);
    }
}
