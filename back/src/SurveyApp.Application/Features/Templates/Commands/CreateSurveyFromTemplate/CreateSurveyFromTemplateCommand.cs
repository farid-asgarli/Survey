using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Domain.Entities;

namespace SurveyApp.Application.Features.Templates.Commands.CreateSurveyFromTemplate;

public record CreateSurveyFromTemplateCommand : IRequest<Result<SurveyDto>>, INamespaceCommand
{
    /// <summary>
    /// The permission required to execute this command.
    /// </summary>
    public static NamespacePermission RequiredPermission => NamespacePermission.CreateSurveys;

    public Guid TemplateId { get; init; }
    public string SurveyTitle { get; init; } = string.Empty;
    public string? Description { get; init; }
    public string? LanguageCode { get; init; }
}
