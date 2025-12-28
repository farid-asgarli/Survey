using AutoMapper;
using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Domain.Interfaces;

namespace SurveyApp.Application.Features.Templates.Queries.GetTemplates;

public class GetTemplatesQueryHandler(
    ISurveyTemplateRepository templateRepository,
    INamespaceContext namespaceContext,
    IMapper mapper
) : IRequestHandler<GetTemplatesQuery, Result<PagedList<SurveyTemplateSummaryDto>>>
{
    private readonly ISurveyTemplateRepository _templateRepository = templateRepository;
    private readonly INamespaceContext _namespaceContext = namespaceContext;
    private readonly IMapper _mapper = mapper;

    public async Task<Result<PagedList<SurveyTemplateSummaryDto>>> Handle(
        GetTemplatesQuery request,
        CancellationToken cancellationToken
    )
    {
        var namespaceId = _namespaceContext.CurrentNamespaceId;
        if (!namespaceId.HasValue)
        {
            return Result<PagedList<SurveyTemplateSummaryDto>>.Failure(
                "Handler.NamespaceContextRequired"
            );
        }

        var (templates, totalCount) = await _templateRepository.GetPagedAsync(
            namespaceId.Value,
            request.PageNumber,
            request.PageSize,
            request.SearchTerm,
            request.Category,
            request.IsPublic,
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
            })
            .ToList();

        var pagedList = new PagedList<SurveyTemplateSummaryDto>(
            dtos,
            totalCount,
            request.PageNumber,
            request.PageSize
        );

        return Result<PagedList<SurveyTemplateSummaryDto>>.Success(pagedList);
    }
}
