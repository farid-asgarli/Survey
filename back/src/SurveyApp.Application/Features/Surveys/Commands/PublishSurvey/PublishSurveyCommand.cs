using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Domain.Entities;

namespace SurveyApp.Application.Features.Surveys.Commands.PublishSurvey;

/// <summary>
/// Command to publish a survey.
/// </summary>
/// <param name="SurveyId">The survey ID to publish.</param>
public record PublishSurveyCommand(Guid SurveyId) : IRequest<Result<SurveyDto>>, INamespaceCommand
{
    /// <summary>
    /// The permission required to execute this command.
    /// </summary>
    public static NamespacePermission RequiredPermission => NamespacePermission.EditSurveys;
}
