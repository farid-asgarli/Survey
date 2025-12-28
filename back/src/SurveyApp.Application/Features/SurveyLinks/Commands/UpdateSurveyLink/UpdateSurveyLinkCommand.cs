using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.DTOs;

namespace SurveyApp.Application.Features.SurveyLinks.Commands.UpdateSurveyLink;

/// <summary>
/// Command to update a survey link.
/// </summary>
public record UpdateSurveyLinkCommand : IRequest<Result<SurveyLinkDto>>
{
    public Guid SurveyId { get; init; }
    public Guid LinkId { get; init; }
    public string? Name { get; init; }
    public string? Source { get; init; }
    public string? Medium { get; init; }
    public string? Campaign { get; init; }
    public Dictionary<string, string>? PrefillData { get; init; }
    public DateTime? ExpiresAt { get; init; }
    public int? MaxUses { get; init; }
    public string? Password { get; init; }
    public bool? IsActive { get; init; }
}
