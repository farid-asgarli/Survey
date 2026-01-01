using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Domain.Entities;

namespace SurveyApp.Application.Features.Questions.Queries.GetQuestionById;

/// <summary>
/// Query to get a question by ID.
/// </summary>
/// <param name="SurveyId">The survey ID.</param>
/// <param name="QuestionId">The question ID.</param>
public record GetQuestionByIdQuery(Guid SurveyId, Guid QuestionId)
    : IRequest<Result<QuestionDto>>,
        INamespaceCommand
{
    /// <summary>
    /// The permission required to execute this query.
    /// </summary>
    public static NamespacePermission RequiredPermission => NamespacePermission.ViewSurveys;
}
