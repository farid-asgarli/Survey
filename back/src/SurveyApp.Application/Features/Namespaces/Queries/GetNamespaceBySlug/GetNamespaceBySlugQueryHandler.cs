using AutoMapper;
using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Domain.Interfaces;

namespace SurveyApp.Application.Features.Namespaces.Queries.GetNamespaceBySlug;

public class GetNamespaceBySlugQueryHandler(
    INamespaceRepository namespaceRepository,
    ICurrentUserService currentUserService,
    IMapper mapper
) : IRequestHandler<GetNamespaceBySlugQuery, Result<NamespaceDetailsDto>>
{
    private readonly INamespaceRepository _namespaceRepository = namespaceRepository;
    private readonly ICurrentUserService _currentUserService = currentUserService;
    private readonly IMapper _mapper = mapper;

    public async Task<Result<NamespaceDetailsDto>> Handle(
        GetNamespaceBySlugQuery request,
        CancellationToken cancellationToken
    )
    {
        var @namespace = await _namespaceRepository.GetBySlugAsync(request.Slug, cancellationToken);
        if (@namespace == null)
        {
            return Result<NamespaceDetailsDto>.NotFound("Errors.NamespaceNotFound");
        }

        // Check if user has access
        var userId = _currentUserService.UserId;
        if (!userId.HasValue)
        {
            return Result<NamespaceDetailsDto>.Unauthorized("Errors.UserNotAuthenticated");
        }

        var membership = @namespace.Memberships.FirstOrDefault(m => m.UserId == userId.Value);
        if (membership == null)
        {
            return Result<NamespaceDetailsDto>.Failure("Errors.NoAccessToNamespace");
        }

        var dto = _mapper.Map<NamespaceDetailsDto>(@namespace);
        return Result<NamespaceDetailsDto>.Success(dto);
    }
}
