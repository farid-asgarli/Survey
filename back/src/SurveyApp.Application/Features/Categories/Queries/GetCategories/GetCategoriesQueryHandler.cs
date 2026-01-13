using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Application.DTOs.Common;
using SurveyApp.Domain.Entities;
using SurveyApp.Domain.Interfaces;

namespace SurveyApp.Application.Features.Categories.Queries.GetCategories;

public class GetCategoriesQueryHandler(
    ISurveyCategoryRepository categoryRepository,
    INamespaceContext namespaceContext
) : IRequestHandler<GetCategoriesQuery, Result<PagedResponse<SurveyCategorySummaryDto>>>
{
    private readonly ISurveyCategoryRepository _categoryRepository = categoryRepository;
    private readonly INamespaceContext _namespaceContext = namespaceContext;

    public async Task<Result<PagedResponse<SurveyCategorySummaryDto>>> Handle(
        GetCategoriesQuery request,
        CancellationToken cancellationToken
    )
    {
        var namespaceId = _namespaceContext.CurrentNamespaceId;
        if (!namespaceId.HasValue)
        {
            return Result<PagedResponse<SurveyCategorySummaryDto>>.Failure(
                "Errors.NamespaceContextRequired"
            );
        }

        var (categories, totalCount) = await _categoryRepository.GetPagedAsync(
            namespaceId.Value,
            request.PageNumber,
            request.PageSize,
            request.SearchTerm,
            cancellationToken
        );

        // Get survey counts for the categories
        var categoriesWithCounts = await _categoryRepository.GetWithSurveyCountsAsync(
            namespaceId.Value,
            cancellationToken
        );
        var countDict = categoriesWithCounts.ToDictionary(x => x.Category.Id, x => x.SurveyCount);

        var dtos = categories
            .Select(c => MapToSummaryDto(c, countDict.GetValueOrDefault(c.Id, 0)))
            .ToList();

        var pagedResponse = PagedResponse<SurveyCategorySummaryDto>.Create(
            dtos,
            request.PageNumber,
            request.PageSize,
            totalCount
        );

        return Result<PagedResponse<SurveyCategorySummaryDto>>.Success(pagedResponse);
    }

    private static SurveyCategorySummaryDto MapToSummaryDto(
        SurveyCategory category,
        int surveyCount
    )
    {
        return new SurveyCategorySummaryDto
        {
            Id = category.Id,
            Name = category.Name,
            Description = category.Description,
            Color = category.Color,
            Icon = category.Icon,
            DisplayOrder = category.DisplayOrder,
            IsDefault = category.IsDefault,
            SurveyCount = surveyCount,
            CreatedAt = category.CreatedAt,
        };
    }
}
