using MediatR;
using SurveyApp.Application.Common;

namespace SurveyApp.Application.Features.Auth.Commands.ForgotPassword;

public record ForgotPasswordCommand : IRequest<Result<Unit>>
{
    public required string Email { get; init; }
}
