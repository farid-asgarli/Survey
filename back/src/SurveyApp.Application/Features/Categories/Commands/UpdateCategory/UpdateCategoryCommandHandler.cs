using AutoMapper;
using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Domain.Interfaces;

namespace SurveyApp.Application.Features.Categories.Commands.UpdateCategory;

/// <summary>
/// Handler for updating an existing survey category.
/// </summary>
public class UpdateCategoryCommandHandler(
    ISurveyCategoryRepository categoryRepository,
    IUnitOfWork unitOfWork,
    INamespaceCommandContext commandContext,
    IMapper mapper
) : IRequestHandler<UpdateCategoryCommand, Result<SurveyCategoryDto>>
{
    private readonly ISurveyCategoryRepository _categoryRepository = categoryRepository;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;
    private readonly INamespaceCommandContext _commandContext = commandContext;
    private readonly IMapper _mapper = mapper;

    public async Task<Result<SurveyCategoryDto>> Handle(
        UpdateCategoryCommand request,
        CancellationToken cancellationToken
    )
    {
        // Context is validated by NamespaceValidationBehavior pipeline
        var ctx = _commandContext.Context!;

        // Retrieve the category with change tracking for update
        var category = await _categoryRepository.GetByIdForUpdateAsync(
            request.CategoryId,
            cancellationToken
        );

        if (category == null)
        {
            return Result<SurveyCategoryDto>.Failure("Errors.CategoryNotFound");
        }

        // Verify it belongs to the current namespace
        if (category.NamespaceId != ctx.NamespaceId)
        {
            return Result<SurveyCategoryDto>.Failure("Errors.CategoryNotFound");
        }

        // Check for duplicate name (excluding current category)
        if (
            await _categoryRepository.ExistsByNameAsync(
                ctx.NamespaceId,
                request.Name,
                request.CategoryId,
                cancellationToken
            )
        )
        {
            return Result<SurveyCategoryDto>.Failure($"Errors.CategoryNameExists|{request.Name}");
        }

        // Update the category details
        category.UpdateDetails(request.Name, request.Description, request.LanguageCode);

        // Update color
        if (request.Color != category.Color)
        {
            category.SetColor(request.Color);
        }

        // Update icon
        if (request.Icon != category.Icon)
        {
            category.SetIcon(request.Icon);
        }

        // Update display order if provided
        if (request.DisplayOrder.HasValue)
        {
            category.SetDisplayOrder(request.DisplayOrder.Value);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Retrieve the updated category for mapping
        var updatedCategory = await _categoryRepository.GetByIdAsync(
            category.Id,
            cancellationToken
        );

        var dto = _mapper.Map<SurveyCategoryDto>(updatedCategory);
        return Result<SurveyCategoryDto>.Success(dto);
    }
}
