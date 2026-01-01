using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Domain.Entities;
using SurveyApp.Domain.Interfaces;

namespace SurveyApp.Application.Features.EmailTemplates.Commands.CreateEmailTemplate;

public class CreateEmailTemplateCommandHandler(
    IEmailTemplateRepository templateRepository,
    INamespaceRepository namespaceRepository,
    IUnitOfWork unitOfWork,
    INamespaceContext namespaceContext,
    ICurrentUserService currentUserService
) : IRequestHandler<CreateEmailTemplateCommand, Result<EmailTemplateDto>>
{
    private readonly IEmailTemplateRepository _templateRepository = templateRepository;
    private readonly INamespaceRepository _namespaceRepository = namespaceRepository;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;
    private readonly INamespaceContext _namespaceContext = namespaceContext;
    private readonly ICurrentUserService _currentUserService = currentUserService;

    public async Task<Result<EmailTemplateDto>> Handle(
        CreateEmailTemplateCommand request,
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
            return Result<EmailTemplateDto>.Unauthorized("Errors.UserNotAuthenticated");
        }

        // Check if namespace exists
        var ns = await _namespaceRepository.GetByIdAsync(namespaceId.Value, cancellationToken);
        if (ns == null)
        {
            return Result<EmailTemplateDto>.NotFound("Errors.NamespaceNotFound");
        }

        // Check for duplicate name
        if (
            await _templateRepository.ExistsByNameAsync(
                namespaceId.Value,
                request.Name,
                cancellationToken: cancellationToken
            )
        )
        {
            return Result<EmailTemplateDto>.Failure($"Errors.EmailTemplateExists|{request.Name}");
        }

        // Create template with localization support
        var template = EmailTemplate.Create(
            namespaceId.Value,
            request.Name,
            request.Type,
            request.Subject,
            request.HtmlBody,
            request.LanguageCode,
            request.PlainTextBody,
            request.DesignJson
        );

        // If this should be default, remove default from other templates of same type
        if (request.IsDefault)
        {
            var existingDefault = await _templateRepository.GetDefaultByTypeAsync(
                namespaceId.Value,
                request.Type,
                cancellationToken
            );

            if (existingDefault != null)
            {
                existingDefault.RemoveDefault();
                _templateRepository.Update(existingDefault);
            }

            template.SetAsDefault();
        }

        _templateRepository.Add(template);
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
