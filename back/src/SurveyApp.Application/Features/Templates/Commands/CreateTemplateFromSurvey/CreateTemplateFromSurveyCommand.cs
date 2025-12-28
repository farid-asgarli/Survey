using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Domain.Entities;

namespace SurveyApp.Application.Features.Templates.Commands.CreateTemplateFromSurvey;

public record CreateTemplateFromSurveyCommand
    : IRequest<Result<SurveyTemplateDto>>,
        INamespaceCommand
{
    /// <summary>
    /// The permission required to execute this command.
    /// </summary>
    public static NamespacePermission RequiredPermission => NamespacePermission.CreateSurveys;

    public Guid SurveyId { get; init; }
    public string TemplateName { get; init; } = string.Empty;
    public string? Description { get; init; }
    public string? Category { get; init; }
    public bool IsPublic { get; init; }
}
