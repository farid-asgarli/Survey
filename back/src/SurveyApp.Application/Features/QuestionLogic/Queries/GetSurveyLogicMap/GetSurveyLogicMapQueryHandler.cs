using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Domain.Enums;
using SurveyApp.Domain.Interfaces;

namespace SurveyApp.Application.Features.QuestionLogic.Queries.GetSurveyLogicMap;

public class GetSurveyLogicMapQueryHandler(
    IQuestionLogicRepository questionLogicRepository,
    ISurveyRepository surveyRepository,
    INamespaceContext namespaceContext
) : IRequestHandler<GetSurveyLogicMapQuery, Result<SurveyLogicMapDto>>
{
    private readonly IQuestionLogicRepository _questionLogicRepository = questionLogicRepository;
    private readonly ISurveyRepository _surveyRepository = surveyRepository;
    private readonly INamespaceContext _namespaceContext = namespaceContext;

    public async Task<Result<SurveyLogicMapDto>> Handle(
        GetSurveyLogicMapQuery request,
        CancellationToken cancellationToken
    )
    {
        var namespaceId = _namespaceContext.CurrentNamespaceId;
        if (!namespaceId.HasValue)
        {
            return Result<SurveyLogicMapDto>.Failure("Errors.NamespaceContextRequired");
        }

        // Get survey with questions
        var survey = await _surveyRepository.GetByIdWithQuestionsAsync(
            request.SurveyId,
            cancellationToken
        );
        if (survey == null)
        {
            return Result<SurveyLogicMapDto>.NotFound("Errors.SurveyNotFound");
        }

        // Verify survey belongs to namespace
        if (survey.NamespaceId != namespaceId.Value)
        {
            return Result<SurveyLogicMapDto>.Failure("Errors.SurveyNotInNamespace");
        }

        // Get all logic rules for the survey
        var logicRules = await _questionLogicRepository.GetBySurveyIdAsync(
            request.SurveyId,
            cancellationToken
        );

        // Create a set of questions that have logic rules applied
        var questionsWithLogic = logicRules.Select(l => l.QuestionId).ToHashSet();
        var questionsAsSource = logicRules.Select(l => l.SourceQuestionId).ToHashSet();

        // Build nodes (questions)
        var nodes = survey
            .Questions.OrderBy(q => q.Order)
            .Select(q => new LogicNodeDto
            {
                Id = q.Id,
                Text = q.Text,
                Order = q.Order,
                Type = q.Type.ToString(),
                HasLogic = questionsWithLogic.Contains(q.Id),
                IsConditional = questionsAsSource.Contains(q.Id),
            })
            .ToList();

        // Build edges (logic connections)
        var edges = logicRules
            .Select(l => new LogicEdgeDto
            {
                Id = l.Id,
                SourceId = l.SourceQuestionId,
                TargetId =
                    l.Action == LogicAction.JumpTo && l.TargetQuestionId.HasValue
                        ? l.TargetQuestionId.Value
                        : l.QuestionId,
                Operator = l.Operator,
                ConditionValue = l.ConditionValue,
                Action = l.Action,
                Label = FormatEdgeLabel(l.Operator, l.ConditionValue, l.Action),
            })
            .ToList();

        var result = new SurveyLogicMapDto
        {
            SurveyId = request.SurveyId,
            Nodes = nodes,
            Edges = edges,
        };

        return Result<SurveyLogicMapDto>.Success(result);
    }

    private static string FormatEdgeLabel(
        LogicOperator @operator,
        string conditionValue,
        LogicAction action
    )
    {
        var operatorText = @operator switch
        {
            LogicOperator.Equals => "=",
            LogicOperator.NotEquals => "≠",
            LogicOperator.Contains => "contains",
            LogicOperator.NotContains => "not contains",
            LogicOperator.GreaterThan => ">",
            LogicOperator.LessThan => "<",
            LogicOperator.GreaterThanOrEquals => "≥",
            LogicOperator.LessThanOrEquals => "≤",
            LogicOperator.IsEmpty => "is empty",
            LogicOperator.IsNotEmpty => "is not empty",
            LogicOperator.IsAnswered => "is answered",
            LogicOperator.IsNotAnswered => "is not answered",
            _ => @operator.ToString(),
        };

        var actionText = action switch
        {
            LogicAction.Show => "→ Show",
            LogicAction.Hide => "→ Hide",
            LogicAction.Skip => "→ Skip",
            LogicAction.JumpTo => "→ Jump to",
            LogicAction.EndSurvey => "→ End Survey",
            _ => action.ToString(),
        };

        var valueText = @operator
            is LogicOperator.IsEmpty
                or LogicOperator.IsNotEmpty
                or LogicOperator.IsAnswered
                or LogicOperator.IsNotAnswered
            ? string.Empty
            : $" '{conditionValue}'";

        return $"{operatorText}{valueText} {actionText}";
    }
}
