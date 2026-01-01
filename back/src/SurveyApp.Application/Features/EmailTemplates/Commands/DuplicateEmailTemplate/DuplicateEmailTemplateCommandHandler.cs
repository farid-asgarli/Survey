using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Domain.Entities;
using SurveyApp.Domain.Interfaces;

namespace SurveyApp.Application.Features.EmailTemplates.Commands.DuplicateEmailTemplate;

/// <summary>
/// Handler for duplicating an existing email template.
/// Creates a new template with all content and translations, but as non-default.
/// </summary>
public class DuplicateEmailTemplateCommandHandler(
    IEmailTemplateRepository templateRepository,
    INamespaceRepository namespaceRepository,
    IUnitOfWork unitOfWork,
    INamespaceContext namespaceContext,
    ICurrentUserService currentUserService
) : IRequestHandler<DuplicateEmailTemplateCommand, Result<EmailTemplateDto>>
{
    private readonly IEmailTemplateRepository _templateRepository = templateRepository;
    private readonly INamespaceRepository _namespaceRepository = namespaceRepository;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;
    private readonly INamespaceContext _namespaceContext = namespaceContext;
    private readonly ICurrentUserService _currentUserService = currentUserService;

    public async Task<Result<EmailTemplateDto>> Handle(
        DuplicateEmailTemplateCommand request,
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

        // Get the original template
        var original = await _templateRepository.GetByIdAsync(request.Id, cancellationToken);
        if (original == null)
        {
            return Result<EmailTemplateDto>.NotFound("Errors.EmailTemplateNotFound");
        }

        // Verify the template belongs to the current namespace
        if (original.NamespaceId != namespaceId.Value)
        {
            return Result<EmailTemplateDto>.NotFound("Errors.EmailTemplateNotFound");
        }

        // Generate new name
        var baseName = request.NewName ?? $"{original.Name} (Copy)";
        var newName = await GenerateUniqueNameAsync(namespaceId.Value, baseName, cancellationToken);

        // Get the default translation content
        var defaultTranslation = original.Translations.FirstOrDefault(t =>
            t.LanguageCode.Equals(original.DefaultLanguage, StringComparison.OrdinalIgnoreCase)
        );

        // Create new template with default language content
        var newTemplate = EmailTemplate.Create(
            namespaceId.Value,
            newName,
            original.Type,
            defaultTranslation?.Subject ?? original.Subject,
            defaultTranslation?.HtmlBody ?? original.HtmlBody,
            original.DefaultLanguage,
            defaultTranslation?.PlainTextBody ?? original.PlainTextBody,
            original.DesignJson
        );

        // Copy additional translations (excluding default which was already created)
        foreach (
            var translation in original.Translations.Where(t =>
                !t.LanguageCode.Equals(original.DefaultLanguage, StringComparison.OrdinalIgnoreCase)
            )
        )
        {
            newTemplate.AddOrUpdateTranslation(
                translation.LanguageCode,
                newName, // Use the same new name for all translations
                translation.Subject ?? string.Empty,
                translation.HtmlBody ?? string.Empty,
                translation.PlainTextBody
            );
        }

        _templateRepository.Add(newTemplate);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<EmailTemplateDto>.Success(MapToDto(newTemplate));
    }

    /// <summary>
    /// Generate a unique name by appending a number if needed.
    /// </summary>
    private async Task<string> GenerateUniqueNameAsync(
        Guid namespaceId,
        string baseName,
        CancellationToken cancellationToken
    )
    {
        var candidateName = baseName;
        var counter = 1;

        while (
            await _templateRepository.ExistsByNameAsync(
                namespaceId,
                candidateName,
                cancellationToken: cancellationToken
            )
        )
        {
            counter++;
            candidateName = $"{baseName} ({counter})";
        }

        return candidateName;
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
            DefaultLanguage = template.DefaultLanguage,
            Language = template.DefaultLanguage, // Response is in default language
            AvailableLanguages = [.. template.Translations.Select(t => t.LanguageCode)],
        };
    }
}
