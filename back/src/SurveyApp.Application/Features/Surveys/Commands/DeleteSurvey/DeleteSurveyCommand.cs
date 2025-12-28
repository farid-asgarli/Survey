using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Domain.Entities;

namespace SurveyApp.Application.Features.Surveys.Commands.DeleteSurvey;

public record DeleteSurveyCommand : IRequest<Result<bool>>, INamespaceCommand
{
    /// <summary>
    /// The permission required to execute this command.
    /// </summary>
    public static NamespacePermission RequiredPermission => NamespacePermission.DeleteSurveys;

    public Guid SurveyId { get; init; }
}
