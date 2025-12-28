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
) : IRequestHandler<DeleteEmailTemplateCommand, Result<bool>>
{
    private readonly IEmailTemplateRepository _templateRepository = templateRepository;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;
    private readonly INamespaceContext _namespaceContext = namespaceContext;
    private readonly ICurrentUserService _currentUserService = currentUserService;

    public async Task<Result<bool>> Handle(
        DeleteEmailTemplateCommand request,
        CancellationToken cancellationToken
    )
    {
        var namespaceId = _namespaceContext.CurrentNamespaceId;
        if (!namespaceId.HasValue)
        {
            return Result<bool>.Failure("Errors.NamespaceRequired");
        }

        var userId = _currentUserService.UserId;
        if (!userId.HasValue)
        {
            return Result<bool>.Failure("Errors.UserNotAuthenticated");
        }

        // Get existing template
        var template = await _templateRepository.GetByIdAsync(request.Id, cancellationToken);
        if (template == null)
        {
            return Result<bool>.Failure("Errors.EmailTemplateNotFound");
        }

        // Verify namespace ownership
        if (template.NamespaceId != namespaceId.Value)
        {
            return Result<bool>.Failure("Errors.EmailTemplateNotFound");
        }

        _templateRepository.Delete(template);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
