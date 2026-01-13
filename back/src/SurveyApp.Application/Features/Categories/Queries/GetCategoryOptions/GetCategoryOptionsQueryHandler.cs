using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Domain.Interfaces;

namespace SurveyApp.Application.Features.Categories.Queries.GetCategoryOptions;

public class GetCategoryOptionsQueryHandler(
    ISurveyCategoryRepository categoryRepository,
    INamespaceContext namespaceContext
) : IRequestHandler<GetCategoryOptionsQuery, Result<IReadOnlyList<CategoryOptionDto>>>
{
    private readonly ISurveyCategoryRepository _categoryRepository = categoryRepository;
    private readonly INamespaceContext _namespaceContext = namespaceContext;

    public async Task<Result<IReadOnlyList<CategoryOptionDto>>> Handle(
        GetCategoryOptionsQuery request,
        CancellationToken cancellationToken
    )
    {
        var namespaceId = _namespaceContext.CurrentNamespaceId;
        if (!namespaceId.HasValue)
        {
            return Result<IReadOnlyList<CategoryOptionDto>>.Failure(
                "Errors.NamespaceContextRequired"
            );
        }

        var categories = await _categoryRepository.GetByNamespaceIdAsync(
            namespaceId.Value,
            cancellationToken
        );

        var options = categories
            .Select(c => new CategoryOptionDto
            {
                Id = c.Id,
                Name = c.Name,
                Color = c.Color,
                Icon = c.Icon,
                IsDefault = c.IsDefault,
            })
            .ToList();

        return Result<IReadOnlyList<CategoryOptionDto>>.Success(options);
    }
}
