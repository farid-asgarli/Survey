using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.DTOs;

namespace SurveyApp.Application.Features.Nps.Queries.GetQuestionNps;

/// <summary>
/// Query to get NPS score for a specific question.
/// </summary>
/// <param name="SurveyId">The survey ID.</param>
/// <param name="QuestionId">The question ID.</param>
public record GetQuestionNpsQuery(Guid SurveyId, Guid QuestionId) : IRequest<Result<NpsScoreDto>>;
