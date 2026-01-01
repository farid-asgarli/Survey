using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Domain.Entities;

namespace SurveyApp.Application.Features.Surveys.Commands.DeleteSurvey;

/// <summary>
/// Command to delete a survey.
/// </summary>
/// <param name="SurveyId">The survey ID to delete.</param>
public record DeleteSurveyCommand(Guid SurveyId) : IRequest<Result<Unit>>, INamespaceCommand
{
    /// <summary>
    /// The permission required to execute this command.
    /// </summary>
    public static NamespacePermission RequiredPermission => NamespacePermission.DeleteSurveys;
}
