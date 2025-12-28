using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.DTOs;

namespace SurveyApp.Application.Features.Namespaces.Queries.GetNamespaceById;

public record GetNamespaceByIdQuery : IRequest<Result<NamespaceDetailsDto>>
{
    public Guid NamespaceId { get; init; }
}
