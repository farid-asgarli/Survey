using MediatR;
using SurveyApp.Application.Common;

namespace SurveyApp.Application.Features.SurveyLinks.Commands.RecordLinkClick;

/// <summary>
/// Command to record a click on a survey link.
/// </summary>
public record RecordLinkClickCommand : IRequest<Result<RecordLinkClickResult>>
{
    public string Token { get; init; } = null!;
    public string? IpAddress { get; init; }
    public string? UserAgent { get; init; }
    public string? Referrer { get; init; }
    public string? Password { get; init; }
}

/// <summary>
/// Result of recording a link click.
/// </summary>
public record RecordLinkClickResult
{
    public Guid SurveyId { get; init; }
    public string SurveyAccessToken { get; init; } = null!;
    public Guid ClickId { get; init; }
    public Dictionary<string, string>? PrefillData { get; init; }
}
