using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Domain.Interfaces;

namespace SurveyApp.Application.Features.Templates.Commands.DeleteTemplate;

/// <summary>
/// Handler for deleting a template.
/// Namespace and permission validation is handled by NamespaceValidationBehavior pipeline.
/// </summary>
public class DeleteTemplateCommandHandler(
    ISurveyTemplateRepository templateRepository,
    IUnitOfWork unitOfWork,
    INamespaceCommandContext commandContext
) : IRequestHandler<DeleteTemplateCommand, Result>
{
    private readonly ISurveyTemplateRepository _templateRepository = templateRepository;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;
    private readonly INamespaceCommandContext _commandContext = commandContext;

    public async Task<Result> Handle(
        DeleteTemplateCommand request,
        CancellationToken cancellationToken
    )
    {
        // Context is validated by NamespaceValidationBehavior pipeline
        var ctx = _commandContext.Context!;

        var template = await _templateRepository.GetByIdForUpdateAsync(
            request.TemplateId,
            cancellationToken
        );
        if (template == null || template.NamespaceId != ctx.NamespaceId)
        {
            return Result.NotFound("Errors.TemplateNotFound");
        }

        _templateRepository.Delete(template);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
