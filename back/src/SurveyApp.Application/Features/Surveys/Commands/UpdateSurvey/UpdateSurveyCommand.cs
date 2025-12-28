using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Domain.Entities;

namespace SurveyApp.Application.Features.Surveys.Commands.UpdateSurvey;

public record UpdateSurveyCommand : IRequest<Result<SurveyDto>>, INamespaceCommand
{
    /// <summary>
    /// The permission required to execute this command.
    /// </summary>
    public static NamespacePermission RequiredPermission => NamespacePermission.EditSurveys;

    public Guid SurveyId { get; init; }
    public string Title { get; init; } = string.Empty;
    public string? Description { get; init; }
    public string? WelcomeMessage { get; init; }
    public string? ThankYouMessage { get; init; }
    public bool AllowAnonymousResponses { get; init; }
    public bool AllowMultipleResponses { get; init; }
    public int? MaxResponses { get; init; }
    public DateTime? StartsAt { get; init; }
    public DateTime? EndsAt { get; init; }
}
