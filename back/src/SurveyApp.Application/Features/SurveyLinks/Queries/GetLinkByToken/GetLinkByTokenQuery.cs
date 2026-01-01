using MediatR;
using SurveyApp.Application.Common;

namespace SurveyApp.Application.Features.SurveyLinks.Queries.GetLinkByToken;

/// <summary>
/// Query to get a survey link by its token (for public access).
/// </summary>
/// <param name="Token">The unique token identifying the link.</param>
public record GetLinkByTokenQuery(string Token) : IRequest<Result<LinkByTokenResult>>;

/// <summary>
/// Result of getting a link by token.
/// </summary>
public record LinkByTokenResult
{
    public Guid LinkId { get; init; }
    public Guid SurveyId { get; init; }
    public string SurveyTitle { get; init; } = null!;
    public bool IsValid { get; init; }
    public string? InvalidReason { get; init; }
    public bool RequiresPassword { get; init; }
}
