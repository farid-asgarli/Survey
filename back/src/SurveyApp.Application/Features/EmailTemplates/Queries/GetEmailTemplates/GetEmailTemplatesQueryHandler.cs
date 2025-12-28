using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Domain.Interfaces;

namespace SurveyApp.Application.Features.EmailTemplates.Queries.GetEmailTemplates;

public class GetEmailTemplatesQueryHandler(
    IEmailTemplateRepository templateRepository,
    INamespaceContext namespaceContext
) : IRequestHandler<GetEmailTemplatesQuery, Result<IReadOnlyList<EmailTemplateSummaryDto>>>
{
    private readonly IEmailTemplateRepository _templateRepository = templateRepository;
    private readonly INamespaceContext _namespaceContext = namespaceContext;

    public async Task<Result<IReadOnlyList<EmailTemplateSummaryDto>>> Handle(
        GetEmailTemplatesQuery request,
        CancellationToken cancellationToken
    )
    {
        var namespaceId = _namespaceContext.CurrentNamespaceId;
        if (!namespaceId.HasValue)
        {
            return Result<IReadOnlyList<EmailTemplateSummaryDto>>.Failure(
                "Errors.NamespaceRequired"
            );
        }

        var (templates, _) = await _templateRepository.GetPagedAsync(
            namespaceId.Value,
            request.PageNumber,
            request.PageSize,
            request.SearchTerm,
            request.Type,
            cancellationToken
        );

        var dtos = templates
            .Select(t => new EmailTemplateSummaryDto
            {
                Id = t.Id,
                Name = t.Name,
                Type = t.Type,
                Subject = t.Subject,
                IsDefault = t.IsDefault,
                CreatedAt = t.CreatedAt,
            })
            .ToList();

        return Result<IReadOnlyList<EmailTemplateSummaryDto>>.Success(dtos);
    }
}
