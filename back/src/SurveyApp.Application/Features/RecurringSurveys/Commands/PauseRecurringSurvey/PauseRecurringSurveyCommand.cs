using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Domain.Entities;

namespace SurveyApp.Application.Features.RecurringSurveys.Commands.PauseRecurringSurvey;

/// <summary>
/// Command to pause a recurring survey.
/// </summary>
/// <param name="Id">The recurring survey ID to pause.</param>
public record PauseRecurringSurveyCommand(Guid Id)
    : IRequest<Result<RecurringSurveyDto>>,
        INamespaceCommand
{
    /// <summary>
    /// The permission required to execute this command.
    /// </summary>
    public static NamespacePermission RequiredPermission => NamespacePermission.EditSurveys;
}
