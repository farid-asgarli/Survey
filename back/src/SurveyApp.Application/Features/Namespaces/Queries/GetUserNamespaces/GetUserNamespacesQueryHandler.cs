using AutoMapper;
using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Domain.Interfaces;

namespace SurveyApp.Application.Features.Namespaces.Queries.GetUserNamespaces;

public class GetUserNamespacesQueryHandler(
    INamespaceRepository namespaceRepository,
    ICurrentUserService currentUserService,
    IMapper mapper
) : IRequestHandler<GetUserNamespacesQuery, Result<IReadOnlyList<NamespaceDto>>>
{
    private readonly INamespaceRepository _namespaceRepository = namespaceRepository;
    private readonly ICurrentUserService _currentUserService = currentUserService;
    private readonly IMapper _mapper = mapper;

    public async Task<Result<IReadOnlyList<NamespaceDto>>> Handle(
        GetUserNamespacesQuery request,
        CancellationToken cancellationToken
    )
    {
        var userId = _currentUserService.UserId;
        if (!userId.HasValue)
        {
            return Result<IReadOnlyList<NamespaceDto>>.Unauthorized("Errors.UserNotAuthenticated");
        }

        var namespaces = await _namespaceRepository.GetByUserIdAsync(
            userId.Value,
            cancellationToken
        );

        var namespaceDtos = _mapper.Map<List<NamespaceDto>>(namespaces);

        return Result<IReadOnlyList<NamespaceDto>>.Success(namespaceDtos);
    }
}
