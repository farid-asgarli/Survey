using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Domain.Entities;

namespace SurveyApp.Application.Features.RecurringSurveys.Commands.TriggerRecurringSurvey;

/// <summary>
/// Command to trigger an immediate run of a recurring survey.
/// </summary>
/// <param name="Id">The recurring survey ID to trigger.</param>
public record TriggerRecurringSurveyCommand(Guid Id)
    : IRequest<Result<RecurringSurveyRunDto>>,
        INamespaceCommand
{
    /// <summary>
    /// The permission required to execute this command.
    /// </summary>
    public static NamespacePermission RequiredPermission => NamespacePermission.EditSurveys;
}
