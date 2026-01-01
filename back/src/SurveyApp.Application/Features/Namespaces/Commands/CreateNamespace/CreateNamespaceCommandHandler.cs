using AutoMapper;
using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Domain.Entities;
using SurveyApp.Domain.Enums;
using SurveyApp.Domain.Interfaces;
using SurveyApp.Domain.ValueObjects;

namespace SurveyApp.Application.Features.Namespaces.Commands.CreateNamespace;

public class CreateNamespaceCommandHandler(
    INamespaceRepository namespaceRepository,
    IUserRepository userRepository,
    IUnitOfWork unitOfWork,
    ICurrentUserService currentUserService,
    IMapper mapper
) : IRequestHandler<CreateNamespaceCommand, Result<NamespaceDto>>
{
    private readonly INamespaceRepository _namespaceRepository = namespaceRepository;
    private readonly IUserRepository _userRepository = userRepository;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;
    private readonly ICurrentUserService _currentUserService = currentUserService;
    private readonly IMapper _mapper = mapper;

    public async Task<Result<NamespaceDto>> Handle(
        CreateNamespaceCommand request,
        CancellationToken cancellationToken
    )
    {
        // Validate slug uniqueness
        var existingNamespace = await _namespaceRepository.GetBySlugAsync(
            request.Slug,
            cancellationToken
        );
        if (existingNamespace != null)
        {
            return Result<NamespaceDto>.Failure("Errors.NamespaceSlugExists");
        }

        // Get current user
        var userId = _currentUserService.UserId;
        if (!userId.HasValue)
        {
            return Result<NamespaceDto>.Unauthorized("Errors.UserNotAuthenticated");
        }

        var user = await _userRepository.GetByIdAsync(userId.Value, cancellationToken);
        if (user == null)
        {
            return Result<NamespaceDto>.NotFound("Errors.UserNotFound");
        }

        // Create namespace slug
        if (!NamespaceSlug.TryCreate(request.Slug, out var slug) || slug == null)
        {
            return Result<NamespaceDto>.Failure("Errors.InvalidSlug");
        }

        // Create namespace
        var @namespace = Namespace.Create(request.Name, slug.Value);

        @namespace.UpdateDetails(request.Name, request.Description, request.LogoUrl);

        // Add creator as owner
        @namespace.AddMember(user, NamespaceRole.Owner);

        await _namespaceRepository.AddAsync(@namespace, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = _mapper.Map<NamespaceDto>(@namespace);
        return Result<NamespaceDto>.Success(dto);
    }
}
