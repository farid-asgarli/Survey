using AutoMapper;
using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Domain.Interfaces;

namespace SurveyApp.Application.Features.Categories.Queries.GetCategoryById;

public class GetCategoryByIdQueryHandler(
    ISurveyCategoryRepository categoryRepository,
    INamespaceContext namespaceContext,
    IMapper mapper
) : IRequestHandler<GetCategoryByIdQuery, Result<SurveyCategoryDto>>
{
    private readonly ISurveyCategoryRepository _categoryRepository = categoryRepository;
    private readonly INamespaceContext _namespaceContext = namespaceContext;
    private readonly IMapper _mapper = mapper;

    public async Task<Result<SurveyCategoryDto>> Handle(
        GetCategoryByIdQuery request,
        CancellationToken cancellationToken
    )
    {
        var namespaceId = _namespaceContext.CurrentNamespaceId;
        if (!namespaceId.HasValue)
        {
            return Result<SurveyCategoryDto>.Failure("Errors.NamespaceContextRequired");
        }

        var category = await _categoryRepository.GetByIdAsync(
            request.CategoryId,
            cancellationToken
        );

        if (category == null)
        {
            return Result<SurveyCategoryDto>.Failure("Errors.CategoryNotFound");
        }

        // Verify it belongs to the current namespace
        if (category.NamespaceId != namespaceId.Value)
        {
            return Result<SurveyCategoryDto>.Failure("Errors.CategoryNotFound");
        }

        // Get survey count for this specific category (efficient single query)
        var surveyCount = await _categoryRepository.GetSurveyCountAsync(
            category.Id,
            cancellationToken
        );

        var dto = _mapper.Map<SurveyCategoryDto>(category);
        dto.SurveyCount = surveyCount;

        return Result<SurveyCategoryDto>.Success(dto);
    }
}
