using MediatR;
using SurveyApp.Application.Common;

namespace SurveyApp.Application.Features.SurveyLinks.Commands.DeactivateSurveyLink;

/// <summary>
/// Command to deactivate a survey link.
/// </summary>
public record DeactivateSurveyLinkCommand : IRequest<Result<bool>>
{
    public Guid SurveyId { get; init; }
    public Guid LinkId { get; init; }
}
