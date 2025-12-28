using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Domain.Entities;

namespace SurveyApp.Application.Features.RecurringSurveys.Commands.PauseRecurringSurvey;

/// <summary>
/// Command to pause a recurring survey.
/// </summary>
public record PauseRecurringSurveyCommand : IRequest<Result<RecurringSurveyDto>>, INamespaceCommand
{
    /// <summary>
    /// The permission required to execute this command.
    /// </summary>
    public static NamespacePermission RequiredPermission => NamespacePermission.EditSurveys;

    /// <summary>
    /// The recurring survey ID to pause.
    /// </summary>
    public Guid Id { get; init; }
}
