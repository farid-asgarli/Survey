using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.DTOs;

namespace SurveyApp.Application.Features.Users.Queries.GetUserPreferences;

public record GetUserPreferencesQuery : IRequest<Result<UserPreferencesDto>>;
