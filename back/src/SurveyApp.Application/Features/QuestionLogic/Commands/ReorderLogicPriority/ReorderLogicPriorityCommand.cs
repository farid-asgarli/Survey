using MediatR;
using SurveyApp.Application.Common;

namespace SurveyApp.Application.Features.QuestionLogic.Commands.ReorderLogicPriority;

/// <summary>
/// Command to reorder logic priority.
/// </summary>
public record ReorderLogicPriorityCommand : IRequest<Result<bool>>
{
    /// <summary>
    /// The survey ID.
    /// </summary>
    public Guid SurveyId { get; init; }

    /// <summary>
    /// The question ID.
    /// </summary>
    public Guid QuestionId { get; init; }

    /// <summary>
    /// The ordered list of logic IDs (first = highest priority).
    /// </summary>
    public List<Guid> LogicIds { get; init; } = [];
}
