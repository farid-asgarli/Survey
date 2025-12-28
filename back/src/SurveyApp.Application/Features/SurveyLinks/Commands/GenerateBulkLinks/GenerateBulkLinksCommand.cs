using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.DTOs;

namespace SurveyApp.Application.Features.SurveyLinks.Commands.GenerateBulkLinks;

/// <summary>
/// Command to generate multiple survey links at once.
/// </summary>
public record GenerateBulkLinksCommand : IRequest<Result<BulkLinkGenerationResultDto>>
{
    public Guid SurveyId { get; init; }
    public int Count { get; init; }
    public string? NamePrefix { get; init; }
    public string? Source { get; init; }
    public string? Medium { get; init; }
    public string? Campaign { get; init; }
    public DateTime? ExpiresAt { get; init; }
}
