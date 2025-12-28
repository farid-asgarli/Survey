using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Domain.Entities;
using SurveyApp.Domain.Enums;

namespace SurveyApp.Application.Features.Templates.Commands.CreateTemplate;

public record CreateTemplateCommand : IRequest<Result<SurveyTemplateDto>>, INamespaceCommand
{
    public static NamespacePermission RequiredPermission => NamespacePermission.CreateSurveys;

    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public string? Category { get; init; }
    public bool IsPublic { get; init; }
    public string? WelcomeMessage { get; init; }
    public string? ThankYouMessage { get; init; }
    public bool DefaultAllowAnonymous { get; init; } = true;
    public bool DefaultAllowMultipleResponses { get; init; }
    public string LanguageCode { get; init; } = "en";
    public List<CreateTemplateQuestionDto> Questions { get; init; } = [];
}

public record CreateTemplateQuestionDto
{
    public string Text { get; init; } = string.Empty;
    public string? Description { get; init; }
    public QuestionType Type { get; init; }
    public bool IsRequired { get; init; }
    public int Order { get; init; }
    public QuestionSettingsDto? Settings { get; init; }
}
