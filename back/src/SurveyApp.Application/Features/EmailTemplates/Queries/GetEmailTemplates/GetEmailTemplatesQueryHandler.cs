using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Application.DTOs.Common;
using SurveyApp.Domain.Entities;
using SurveyApp.Domain.Specifications;
using SurveyApp.Domain.Specifications.EmailTemplates;

namespace SurveyApp.Application.Features.EmailTemplates.Queries.GetEmailTemplates;

public class GetEmailTemplatesQueryHandler(
    ISpecificationRepository<EmailTemplate> templateRepository,
    INamespaceContext namespaceContext
) : IRequestHandler<GetEmailTemplatesQuery, Result<PagedResponse<EmailTemplateSummaryDto>>>
{
    private readonly ISpecificationRepository<EmailTemplate> _templateRepository =
        templateRepository;
    private readonly INamespaceContext _namespaceContext = namespaceContext;

    public async Task<Result<PagedResponse<EmailTemplateSummaryDto>>> Handle(
        GetEmailTemplatesQuery request,
        CancellationToken cancellationToken
    )
    {
        var namespaceId = _namespaceContext.CurrentNamespaceId;
        if (!namespaceId.HasValue)
        {
            return Result<PagedResponse<EmailTemplateSummaryDto>>.Failure(
                "Errors.NamespaceRequired"
            );
        }

        // Use specification pattern for querying
        var criteria = new EmailTemplateFilterCriteria
        {
            NamespaceId = namespaceId.Value,
            SearchTerm = request.SearchTerm,
            Type = request.Type,
            Paging = PagingParameters.Create(request.PageNumber, request.PageSize),
        };

        var spec = new EmailTemplatesFilteredSpec(criteria);
        var (templates, totalCount) = await _templateRepository.GetPagedAsync(
            spec,
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

        var pagedResponse = PagedResponse<EmailTemplateSummaryDto>.Create(
            dtos,
            request.PageNumber,
            request.PageSize,
            totalCount
        );

        return Result<PagedResponse<EmailTemplateSummaryDto>>.Success(pagedResponse);
    }
}
