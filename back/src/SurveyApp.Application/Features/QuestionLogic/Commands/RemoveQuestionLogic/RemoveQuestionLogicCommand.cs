using MediatR;
using SurveyApp.Application.Common;

namespace SurveyApp.Application.Features.QuestionLogic.Commands.RemoveQuestionLogic;

/// <summary>
/// Command to remove question logic.
/// </summary>
public record RemoveQuestionLogicCommand : IRequest<Result<bool>>
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
    /// The logic ID to remove.
    /// </summary>
    public Guid LogicId { get; init; }
}
