using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.DTOs;

namespace SurveyApp.Application.Features.Namespaces.Queries.GetUserNamespaces;

public record GetUserNamespacesQuery : IRequest<Result<IReadOnlyList<NamespaceDto>>> { }
