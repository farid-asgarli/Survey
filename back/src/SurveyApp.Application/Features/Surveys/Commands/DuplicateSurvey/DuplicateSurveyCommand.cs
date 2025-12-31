using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.DTOs;

namespace SurveyApp.Application.Features.Surveys.Commands.DuplicateSurvey;

/// <summary>
/// Command to duplicate an existing survey, creating a new draft copy with all questions and settings.
/// </summary>
public record DuplicateSurveyCommand : IRequest<Result<SurveyDto>>
{
    /// <summary>
    /// The ID of the survey to duplicate.
    /// </summary>
    public Guid SurveyId { get; init; }

    /// <summary>
    /// Optional new title for the duplicated survey.
    /// If not provided, will append "(Copy)" to the original title.
    /// </summary>
    public string? NewTitle { get; init; }
}
