using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Domain.Interfaces;

namespace SurveyApp.Application.Features.Namespaces.Commands.DeleteNamespace;

/// <summary>
/// Handler for deleting a namespace.
/// Namespace and permission validation is handled by NamespaceValidationBehavior pipeline.
/// </summary>
public class DeleteNamespaceCommandHandler(
    INamespaceRepository namespaceRepository,
    IUnitOfWork unitOfWork,
    INamespaceCommandContext commandContext
) : IRequestHandler<DeleteNamespaceCommand, Result<Unit>>
{
    private readonly INamespaceRepository _namespaceRepository = namespaceRepository;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;
    private readonly INamespaceCommandContext _commandContext = commandContext;

    public async Task<Result<Unit>> Handle(
        DeleteNamespaceCommand request,
        CancellationToken cancellationToken
    )
    {
        // Context is validated by NamespaceValidationBehavior pipeline
        var ctx = _commandContext.Context!;

        var @namespace = await _namespaceRepository.GetByIdForUpdateAsync(
            request.NamespaceId,
            cancellationToken
        );

        if (@namespace == null || @namespace.Id != ctx.NamespaceId)
        {
            return Result<Unit>.NotFound("Errors.NamespaceNotFound");
        }

        _namespaceRepository.Delete(@namespace);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<Unit>.Success(Unit.Value);
    }
}
