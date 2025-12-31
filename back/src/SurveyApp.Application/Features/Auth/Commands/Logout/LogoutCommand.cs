using MediatR;
using SurveyApp.Application.Common;

namespace SurveyApp.Application.Features.Auth.Commands.Logout;

public record LogoutCommand : IRequest<Result<Unit>>;
