using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Domain.Entities;

namespace SurveyApp.Application.Features.Themes.Commands.ApplyThemeToSurvey;

/// <summary>
/// Command to apply a theme to a survey.
/// </summary>
public record ApplyThemeToSurveyCommand : IRequest<Result<SurveyDto>>, INamespaceCommand
{
    /// <summary>
    /// The permission required to execute this command.
    /// </summary>
    public static NamespacePermission RequiredPermission => NamespacePermission.EditSurveys;

    public Guid SurveyId { get; init; }
    public Guid? ThemeId { get; init; }
    public string? PresetThemeId { get; init; }
    public string? ThemeCustomizations { get; init; }
}
