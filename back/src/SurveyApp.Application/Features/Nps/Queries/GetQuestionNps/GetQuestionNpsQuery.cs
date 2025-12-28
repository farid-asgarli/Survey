using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.DTOs;

namespace SurveyApp.Application.Features.Nps.Queries.GetQuestionNps;

/// <summary>
/// Query to get NPS score for a specific question.
/// </summary>
public record GetQuestionNpsQuery : IRequest<Result<NpsScoreDto>>
{
    /// <summary>
    /// Gets or sets the survey ID.
    /// </summary>
    public Guid SurveyId { get; init; }

    /// <summary>
    /// Gets or sets the question ID.
    /// </summary>
    public Guid QuestionId { get; init; }
}
