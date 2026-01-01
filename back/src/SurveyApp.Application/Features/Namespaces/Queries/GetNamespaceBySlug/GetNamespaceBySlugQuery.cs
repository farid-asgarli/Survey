using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.DTOs;

namespace SurveyApp.Application.Features.Namespaces.Queries.GetNamespaceBySlug;

public record GetNamespaceBySlugQuery(string Slug) : IRequest<Result<NamespaceDetailsDto>>;
