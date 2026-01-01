using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Domain.Entities;

namespace SurveyApp.Application.Features.RecurringSurveys.Commands.DeleteRecurringSurvey;

/// <summary>
/// Command to delete a recurring survey.
/// </summary>
/// <param name="Id">The recurring survey ID to delete.</param>
public record DeleteRecurringSurveyCommand(Guid Id) : IRequest<Result<Unit>>, INamespaceCommand
{
    /// <summary>
    /// The permission required to execute this command.
    /// </summary>
    public static NamespacePermission RequiredPermission => NamespacePermission.DeleteSurveys;
}
