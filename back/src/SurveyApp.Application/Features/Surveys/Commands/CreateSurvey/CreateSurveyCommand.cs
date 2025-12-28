using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Domain.Entities;
using SurveyApp.Domain.Enums;

namespace SurveyApp.Application.Features.Surveys.Commands.CreateSurvey;

public record CreateSurveyCommand : IRequest<Result<SurveyDto>>, INamespaceCommand
{
    /// <summary>
    /// The permission required to execute this command.
    /// </summary>
    public static NamespacePermission RequiredPermission => NamespacePermission.CreateSurveys;

    public string Title { get; init; } = string.Empty;
    public string? Description { get; init; }
    public string? WelcomeMessage { get; init; }
    public string? ThankYouMessage { get; init; }
    public bool IsAnonymous { get; init; }
    public int? MaxResponses { get; init; }
    public DateTime? StartDate { get; init; }
    public DateTime? EndDate { get; init; }
    public List<CreateQuestionDto> Questions { get; init; } = [];
}

public record CreateQuestionDto
{
    public string Text { get; init; } = string.Empty;
    public string? Description { get; init; }
    public QuestionType Type { get; init; }
    public bool IsRequired { get; init; }
    public int Order { get; init; }

    /// <summary>
    /// Question settings. Uses QuestionSettingsDto from DTOs namespace which includes
    /// all properties like RatingStyle, YesNoStyle, AllowOther, MatrixRows, etc.
    /// </summary>
    public QuestionSettingsDto? Settings { get; init; }
}
