using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.DTOs;

namespace SurveyApp.Application.Features.Users.Queries.GetCurrentUser;

public record GetCurrentUserQuery : IRequest<Result<UserProfileDto>> { }
