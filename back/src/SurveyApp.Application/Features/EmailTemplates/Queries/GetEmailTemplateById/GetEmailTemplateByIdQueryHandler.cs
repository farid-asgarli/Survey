using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Domain.Entities;
using SurveyApp.Domain.Interfaces;

namespace SurveyApp.Application.Features.EmailTemplates.Queries.GetEmailTemplateById;

public class GetEmailTemplateByIdQueryHandler(
    IEmailTemplateRepository templateRepository,
    INamespaceContext namespaceContext
) : IRequestHandler<GetEmailTemplateByIdQuery, Result<EmailTemplateDto>>
{
    private readonly IEmailTemplateRepository _templateRepository = templateRepository;
    private readonly INamespaceContext _namespaceContext = namespaceContext;

    public async Task<Result<EmailTemplateDto>> Handle(
        GetEmailTemplateByIdQuery request,
        CancellationToken cancellationToken
    )
    {
        var namespaceId = _namespaceContext.CurrentNamespaceId;
        if (!namespaceId.HasValue)
        {
            return Result<EmailTemplateDto>.Failure("Errors.NamespaceRequired");
        }

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
