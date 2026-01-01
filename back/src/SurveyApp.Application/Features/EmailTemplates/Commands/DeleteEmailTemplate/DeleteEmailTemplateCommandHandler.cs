using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Domain.Interfaces;

namespace SurveyApp.Application.Features.EmailTemplates.Commands.DeleteEmailTemplate;

public class DeleteEmailTemplateCommandHandler(
    IEmailTemplateRepository templateRepository,
    IUnitOfWork unitOfWork,
    INamespaceContext namespaceContext,
    ICurrentUserService currentUserService
) : IRequestHandler<DeleteEmailTemplateCommand, Result<Unit>>
{
    private readonly IEmailTemplateRepository _templateRepository = templateRepository;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;
    private readonly INamespaceContext _namespaceContext = namespaceContext;
    private readonly ICurrentUserService _currentUserService = currentUserService;

    public async Task<Result<Unit>> Handle(
        DeleteEmailTemplateCommand request,
        CancellationToken cancellationToken
    )
    {
        var namespaceId = _namespaceContext.CurrentNamespaceId;
        if (!namespaceId.HasValue)
        {
            return Result<Unit>.Failure("Errors.NamespaceRequired");
        }

        var userId = _currentUserService.UserId;
        if (!userId.HasValue)
        {
            return Result<Unit>.Unauthorized("Errors.UserNotAuthenticated");
        }

        // Get existing template with change tracking for delete
        var template = await _templateRepository.GetByIdForUpdateAsync(
            request.Id,
            cancellationToken
        );
        if (template == null)
        {
            return Result<Unit>.NotFound("Errors.EmailTemplateNotFound");
        }

        // Verify namespace ownership
        if (template.NamespaceId != namespaceId.Value)
        {
            return Result<Unit>.NotFound("Errors.EmailTemplateNotFound");
        }

        _templateRepository.Delete(template);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<Unit>.Success(Unit.Value);
    }
}
