using AutoMapper;
using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Domain.Interfaces;

namespace SurveyApp.Application.Features.Namespaces.Commands.UpdateNamespace;

/// <summary>
/// Handler for updating namespace details.
/// Namespace and permission validation is handled by NamespaceValidationBehavior pipeline.
/// </summary>
public class UpdateNamespaceCommandHandler(
    INamespaceRepository namespaceRepository,
    IUnitOfWork unitOfWork,
    INamespaceCommandContext commandContext,
    IMapper mapper
) : IRequestHandler<UpdateNamespaceCommand, Result<NamespaceDto>>
{
    private readonly INamespaceRepository _namespaceRepository = namespaceRepository;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;
    private readonly INamespaceCommandContext _commandContext = commandContext;
    private readonly IMapper _mapper = mapper;

    public async Task<Result<NamespaceDto>> Handle(
        UpdateNamespaceCommand request,
        CancellationToken cancellationToken
    )
    {
        // Context is validated by NamespaceValidationBehavior pipeline
        var ctx = _commandContext.Context!;

        var @namespace = await _namespaceRepository.GetByIdAsync(
            request.NamespaceId,
            cancellationToken
        );
        if (@namespace == null || @namespace.Id != ctx.NamespaceId)
        {
            return Result<NamespaceDto>.Failure("Errors.NamespaceNotFound");
        }

        @namespace.UpdateDetails(request.Name, request.Description, request.LogoUrl);

        _namespaceRepository.Update(@namespace);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = _mapper.Map<NamespaceDto>(@namespace);
        return Result<NamespaceDto>.Success(dto);
    }
}
