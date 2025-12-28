using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Domain.Entities;

namespace SurveyApp.Application.Features.RecurringSurveys.Commands.DeleteRecurringSurvey;

/// <summary>
/// Command to delete a recurring survey.
/// </summary>
public record DeleteRecurringSurveyCommand : IRequest<Result<bool>>, INamespaceCommand
{
    /// <summary>
    /// The permission required to execute this command.
    /// </summary>
    public static NamespacePermission RequiredPermission => NamespacePermission.DeleteSurveys;

    /// <summary>
    /// The recurring survey ID to delete.
    /// </summary>
    public Guid Id { get; init; }
}
