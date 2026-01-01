using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Domain.Entities;

namespace SurveyApp.Application.Features.Surveys.Commands.CloseSurvey;

/// <summary>
/// Command to close a survey.
/// </summary>
/// <param name="SurveyId">The survey ID to close.</param>
public record CloseSurveyCommand(Guid SurveyId) : IRequest<Result<SurveyDto>>, INamespaceCommand
{
    /// <summary>
    /// The permission required to execute this command.
    /// </summary>
    public static NamespacePermission RequiredPermission => NamespacePermission.EditSurveys;
}
