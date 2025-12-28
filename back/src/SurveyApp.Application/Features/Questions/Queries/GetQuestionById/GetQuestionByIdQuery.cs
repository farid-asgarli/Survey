using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Domain.Entities;

namespace SurveyApp.Application.Features.Questions.Queries.GetQuestionById;

public record GetQuestionByIdQuery : IRequest<Result<QuestionDto>>, INamespaceCommand
{
    /// <summary>
    /// The permission required to execute this query.
    /// </summary>
    public static NamespacePermission RequiredPermission => NamespacePermission.ViewSurveys;

    public Guid SurveyId { get; init; }
    public Guid QuestionId { get; init; }
}
