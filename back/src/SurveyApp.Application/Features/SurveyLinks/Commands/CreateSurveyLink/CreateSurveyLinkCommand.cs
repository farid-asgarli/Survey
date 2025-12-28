using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.DTOs;
using SurveyApp.Domain.Enums;

namespace SurveyApp.Application.Features.SurveyLinks.Commands.CreateSurveyLink;

/// <summary>
/// Command to create a new survey link.
/// </summary>
public record CreateSurveyLinkCommand : IRequest<Result<SurveyLinkDto>>
{
    public Guid SurveyId { get; init; }
    public SurveyLinkType Type { get; init; }
    public string? Name { get; init; }
    public string? Source { get; init; }
    public string? Medium { get; init; }
    public string? Campaign { get; init; }
    public Dictionary<string, string>? PrefillData { get; init; }
    public DateTime? ExpiresAt { get; init; }
    public int? MaxUses { get; init; }
    public string? Password { get; init; }
}
