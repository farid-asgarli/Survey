using AutoMapper;
using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Application.DTOs.Common;
using SurveyApp.Domain.Entities;
using SurveyApp.Domain.Specifications;
using SurveyApp.Domain.Specifications.Templates;

namespace SurveyApp.Application.Features.Templates.Queries.GetTemplates;

public class GetTemplatesQueryHandler(
    ISpecificationRepository<SurveyTemplate> templateRepository,
    INamespaceContext namespaceContext,
    IMapper mapper
) : IRequestHandler<GetTemplatesQuery, Result<PagedResponse<SurveyTemplateSummaryDto>>>
{
    private readonly ISpecificationRepository<SurveyTemplate> _templateRepository =
        templateRepository;
    private readonly INamespaceContext _namespaceContext = namespaceContext;
    private readonly IMapper _mapper = mapper;

    public async Task<Result<PagedResponse<SurveyTemplateSummaryDto>>> Handle(
        GetTemplatesQuery request,
        CancellationToken cancellationToken
    )
    {
        var namespaceId = _namespaceContext.CurrentNamespaceId;
        if (!namespaceId.HasValue)
        {
            return Result<PagedResponse<SurveyTemplateSummaryDto>>.Failure(
                "Errors.NamespaceContextRequired"
            );
        }

        // Use specification pattern for querying
        var criteria = new TemplateFilterCriteria
        {
            NamespaceId = namespaceId.Value,
            SearchTerm = request.SearchTerm,
            Category = request.Category,
            IsPublic = request.IsPublic,
            Paging = PagingParameters.Create(request.PageNumber, request.PageSize),
        };

        var spec = new TemplatesFilteredSpec(criteria);
        var (templates, totalCount) = await _templateRepository.GetPagedAsync(
            spec,
            cancellationToken
        );

        var dtos = templates
            .Select(t => new SurveyTemplateSummaryDto
            {
                Id = t.Id,
                Name = t.Name,
                Description = t.Description,
                Category = t.Category,
                IsPublic = t.IsPublic,
                UsageCount = t.UsageCount,
                QuestionCount = t.Questions.Count,
                CreatedAt = t.CreatedAt,
                UpdatedAt = t.UpdatedAt,
                DefaultLanguage = t.DefaultLanguage,
            })
            .ToList();

        var pagedResponse = PagedResponse<SurveyTemplateSummaryDto>.Create(
            dtos,
            request.PageNumber,
            request.PageSize,
            totalCount
        );

        return Result<PagedResponse<SurveyTemplateSummaryDto>>.Success(pagedResponse);
    }
}
