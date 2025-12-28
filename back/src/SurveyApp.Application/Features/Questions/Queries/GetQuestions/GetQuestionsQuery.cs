using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Domain.Entities;

namespace SurveyApp.Application.Features.Questions.Queries.GetQuestions;

public record GetQuestionsQuery : IRequest<Result<IReadOnlyList<QuestionDto>>>, INamespaceCommand
{
    /// <summary>
    /// The permission required to execute this query.
    /// </summary>
    public static NamespacePermission RequiredPermission => NamespacePermission.ViewSurveys;

    public Guid SurveyId { get; init; }
}
