using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Domain.Entities;
using SurveyApp.Domain.Interfaces;

namespace SurveyApp.Application.Features.EmailTemplates.Commands.UpdateEmailTemplate;

public class UpdateEmailTemplateCommandHandler(
    IEmailTemplateRepository templateRepository,
    IUnitOfWork unitOfWork,
    INamespaceContext namespaceContext,
    ICurrentUserService currentUserService
) : IRequestHandler<UpdateEmailTemplateCommand, Result<EmailTemplateDto>>
{
    private readonly IEmailTemplateRepository _templateRepository = templateRepository;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;
    private readonly INamespaceContext _namespaceContext = namespaceContext;
    private readonly ICurrentUserService _currentUserService = currentUserService;

    public async Task<Result<EmailTemplateDto>> Handle(
        UpdateEmailTemplateCommand request,
        CancellationToken cancellationToken
    )
    {
        var namespaceId = _namespaceContext.CurrentNamespaceId;
        if (!namespaceId.HasValue)
        {
            return Result<EmailTemplateDto>.Failure("Errors.NamespaceRequired");
        }

        var userId = _currentUserService.UserId;
        if (!userId.HasValue)
        {
            return Result<EmailTemplateDto>.Failure("Errors.UserNotAuthenticated");
        }

        // Get existing template
        var template = await _templateRepository.GetByIdAsync(request.Id, cancellationToken);
        if (template == null)
        {
            return Result<EmailTemplateDto>.Failure("Errors.EmailTemplateNotFound");
        }

        // Verify namespace ownership
        if (template.NamespaceId != namespaceId.Value)
        {
            return Result<EmailTemplateDto>.Failure("Errors.EmailTemplateNotFound");
        }

        // Check for duplicate name if name is being changed
        if (!string.IsNullOrWhiteSpace(request.Name) && request.Name != template.Name)
        {
            if (
                await _templateRepository.ExistsByNameAsync(
                    namespaceId.Value,
                    request.Name,
                    request.Id,
                    cancellationToken
                )
            )
            {
                return Result<EmailTemplateDto>.Failure(
                    $"Errors.EmailTemplateExists|{request.Name}"
                );
            }
        }

        // Update with localization support
        if (!string.IsNullOrEmpty(request.LanguageCode))
        {
            // Update specific language translation
            template.AddOrUpdateTranslation(
                request.LanguageCode,
                request.Name ?? template.Name,
                request.Subject ?? template.Subject,
                request.HtmlBody ?? template.HtmlBody,
                request.PlainTextBody,
                request.DesignJson
            );
        }
        else
        {
            // Update default language
            if (!string.IsNullOrWhiteSpace(request.Name))
            {
                template.UpdateName(request.Name);
            }

            if (!string.IsNullOrWhiteSpace(request.Subject))
            {
                template.UpdateSubject(request.Subject);
            }

            if (!string.IsNullOrWhiteSpace(request.HtmlBody))
            {
                template.UpdateHtmlBody(request.HtmlBody);
            }

            if (request.PlainTextBody != null)
            {
                template.UpdatePlainTextBody(request.PlainTextBody);
            }

            if (request.DesignJson != null)
            {
                template.UpdateDesignJson(request.DesignJson);
            }
        }

        if (request.Type.HasValue)
        {
            template.UpdateType(request.Type.Value);
        }

        // Handle default status change
        if (request.IsDefault.HasValue)
        {
            if (request.IsDefault.Value && !template.IsDefault)
            {
                var existingDefault = await _templateRepository.GetDefaultByTypeAsync(
                    namespaceId.Value,
                    request.Type ?? template.Type,
                    cancellationToken
                );

                if (existingDefault != null && existingDefault.Id != template.Id)
                {
                    existingDefault.RemoveDefault();
                    _templateRepository.Update(existingDefault);
                }

                template.SetAsDefault();
            }
            else if (!request.IsDefault.Value && template.IsDefault)
            {
                template.RemoveDefault();
            }
        }

        _templateRepository.Update(template);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<EmailTemplateDto>.Success(MapToDto(template));
    }

    private static EmailTemplateDto MapToDto(EmailTemplate template)
    {
        return new EmailTemplateDto
        {
            Id = template.Id,
            NamespaceId = template.NamespaceId,
            Name = template.Name,
            Type = template.Type,
            Subject = template.Subject,
            HtmlBody = template.HtmlBody,
            PlainTextBody = template.PlainTextBody,
            DesignJson = template.DesignJson,
            IsDefault = template.IsDefault,
            AvailablePlaceholders = template.AvailablePlaceholders,
            CreatedAt = template.CreatedAt,
            UpdatedAt = template.UpdatedAt,
        };
    }
}
