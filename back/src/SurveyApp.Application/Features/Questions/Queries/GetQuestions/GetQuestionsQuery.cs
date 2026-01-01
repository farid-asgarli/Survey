using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Domain.Entities;

namespace SurveyApp.Application.Features.Questions.Queries.GetQuestions;

/// <summary>
/// Query to get all questions in a survey.
/// </summary>
/// <param name="SurveyId">The survey ID.</param>
public record GetQuestionsQuery(Guid SurveyId)
    : IRequest<Result<IReadOnlyList<QuestionDto>>>,
        INamespaceCommand
{
    /// <summary>
    /// The permission required to execute this query.
    /// </summary>
    public static NamespacePermission RequiredPermission => NamespacePermission.ViewSurveys;
}
