using MediatR;
using SurveyApp.Application.Common;

namespace SurveyApp.Application.Features.Auth.Commands.ResetPassword;

public record ResetPasswordCommand : IRequest<Result<Unit>>
{
    public required string Email { get; init; }
    public required string Token { get; init; }
    public required string NewPassword { get; init; }
}
