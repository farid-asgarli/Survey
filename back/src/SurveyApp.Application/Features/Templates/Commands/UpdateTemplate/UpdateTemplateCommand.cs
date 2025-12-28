using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Domain.Entities;
using SurveyApp.Domain.Enums;

namespace SurveyApp.Application.Features.Templates.Commands.UpdateTemplate;

public record UpdateTemplateCommand : IRequest<Result<SurveyTemplateDto>>, INamespaceCommand
{
    /// <summary>
    /// The permission required to execute this command.
    /// </summary>
    public static NamespacePermission RequiredPermission => NamespacePermission.EditSurveys;

    public Guid TemplateId { get; init; }
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public string? Category { get; init; }
    public bool IsPublic { get; init; }
    public string? WelcomeMessage { get; init; }
    public string? ThankYouMessage { get; init; }
    public bool DefaultAllowAnonymous { get; init; }
    public bool DefaultAllowMultipleResponses { get; init; }
    public string? LanguageCode { get; init; }
    public List<UpdateTemplateQuestionDto> Questions { get; init; } = [];
}

public record UpdateTemplateQuestionDto
{
    public Guid? Id { get; init; } // Null for new questions
    public string Text { get; init; } = string.Empty;
    public string? Description { get; init; }
    public QuestionType Type { get; init; }
    public bool IsRequired { get; init; }
    public int Order { get; init; }
    public QuestionSettingsDto? Settings { get; init; }
}
