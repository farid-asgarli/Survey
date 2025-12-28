using MediatR;
using SurveyApp.Application.Common;

namespace SurveyApp.Application.Features.EmailDistributions.Commands.TrackOpen;

/// <summary>
/// Command to track email open event.
/// </summary>
public record TrackOpenCommand(string Token) : IRequest<Result<bool>>;
