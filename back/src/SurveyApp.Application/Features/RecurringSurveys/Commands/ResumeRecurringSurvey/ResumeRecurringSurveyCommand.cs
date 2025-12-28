using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Domain.Entities;

namespace SurveyApp.Application.Features.RecurringSurveys.Commands.ResumeRecurringSurvey;

/// <summary>
/// Command to resume a paused recurring survey.
/// </summary>
public record ResumeRecurringSurveyCommand : IRequest<Result<RecurringSurveyDto>>, INamespaceCommand
{
    /// <summary>
    /// The permission required to execute this command.
    /// </summary>
    public static NamespacePermission RequiredPermission => NamespacePermission.EditSurveys;

    /// <summary>
    /// The recurring survey ID to resume.
    /// </summary>
    public Guid Id { get; init; }
}
