using SurveyApp.Domain.Enums;

namespace SurveyApp.Application.DTOs;

/// <summary>
/// DTO for question logic data.
/// </summary>
public class QuestionLogicDto
{
    public Guid Id { get; set; }
    public Guid QuestionId { get; set; }
    public Guid SourceQuestionId { get; set; }
    public string SourceQuestionText { get; set; } = null!;
    public LogicOperator Operator { get; set; }
    public string ConditionValue { get; set; } = null!;
    public LogicAction Action { get; set; }
    public Guid? TargetQuestionId { get; set; }
    public string? TargetQuestionText { get; set; }
    public int Priority { get; set; }
}

/// <summary>
/// DTO for creating question logic.
/// </summary>
public class CreateQuestionLogicDto
{
    public Guid SourceQuestionId { get; set; }
    public LogicOperator Operator { get; set; }
    public string ConditionValue { get; set; } = string.Empty;
    public LogicAction Action { get; set; }
    public Guid? TargetQuestionId { get; set; }
    public int Priority { get; set; }
}

/// <summary>
/// DTO for updating question logic.
/// </summary>
public class UpdateQuestionLogicDto
{
    public Guid SourceQuestionId { get; set; }
    public LogicOperator Operator { get; set; }
    public string ConditionValue { get; set; } = string.Empty;
    public LogicAction Action { get; set; }
    public Guid? TargetQuestionId { get; set; }
    public int Priority { get; set; }
}

/// <summary>
/// DTO for survey logic map visualization.
/// </summary>
public class SurveyLogicMapDto
{
    public Guid SurveyId { get; set; }
    public List<LogicNodeDto> Nodes { get; set; } = [];
    public List<LogicEdgeDto> Edges { get; set; } = [];
}

/// <summary>
/// Represents a node (question) in the logic map.
/// </summary>
public class LogicNodeDto
{
    public Guid Id { get; set; }
    public string Text { get; set; } = null!;
    public int Order { get; set; }
    public string Type { get; set; } = null!;
    public bool HasLogic { get; set; }
    public bool IsConditional { get; set; }
}

/// <summary>
/// Represents an edge (logic connection) in the logic map.
/// </summary>
public class LogicEdgeDto
{
    public Guid Id { get; set; }
    public Guid SourceId { get; set; }
    public Guid TargetId { get; set; }
    public LogicOperator Operator { get; set; }
    public string ConditionValue { get; set; } = null!;
    public LogicAction Action { get; set; }
    public string Label { get; set; } = null!;
}

/// <summary>
/// DTO for logic evaluation request.
/// </summary>
public class EvaluateLogicRequestDto
{
    public List<AnswerForEvaluationDto> Answers { get; set; } = [];
}

/// <summary>
/// DTO for an answer used in logic evaluation.
/// </summary>
public class AnswerForEvaluationDto
{
    public Guid QuestionId { get; set; }
    public string Value { get; set; } = string.Empty;
}

/// <summary>
/// DTO for logic evaluation result.
/// </summary>
public class LogicEvaluationResultDto
{
    public List<Guid> VisibleQuestionIds { get; set; } = [];
    public List<Guid> HiddenQuestionIds { get; set; } = [];
    public Guid? NextQuestionId { get; set; }
    public bool ShouldEndSurvey { get; set; }
}
