using MediatR;
using SurveyApp.Application.Common;

namespace SurveyApp.Application.Features.Users.Commands.ChangePassword;

/// <summary>
/// Command to change the current user's password.
/// </summary>
public record ChangePasswordCommand : IRequest<Result<Unit>>
{
    /// <summary>
    /// The user's current password.
    /// </summary>
    public string CurrentPassword { get; init; } = string.Empty;

    /// <summary>
    /// The new password to set.
    /// </summary>
    public string NewPassword { get; init; } = string.Empty;
}
