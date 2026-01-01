using MediatR;
using SurveyApp.Application.Common;

namespace SurveyApp.Application.Features.EmailDistributions.Commands.TrackClick;

/// <summary>
/// Command to track link click event.
/// Returns the survey access token for redirect.
/// </summary>
public record TrackClickCommand(string Token) : IRequest<Result<string>>;
