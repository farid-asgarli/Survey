using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Domain.Entities;
using SurveyApp.Domain.Enums;

namespace SurveyApp.Application.Features.Questions.Commands.UpdateQuestion;

public record UpdateQuestionCommand : IRequest<Result<QuestionDto>>, INamespaceCommand
{
    /// <summary>
    /// The permission required to execute this command.
    /// </summary>
    public static NamespacePermission RequiredPermission => NamespacePermission.EditSurveys;

    public Guid SurveyId { get; init; }
    public Guid QuestionId { get; init; }
    public string Text { get; init; } = string.Empty;
    public string? Description { get; init; }
    public QuestionType Type { get; init; }
    public bool IsRequired { get; init; }
    public int? Order { get; init; }
    public QuestionSettingsDto? Settings { get; init; }
    public bool IsNpsQuestion { get; init; }
    public NpsQuestionType? NpsType { get; init; }
}
