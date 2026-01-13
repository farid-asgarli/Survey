using AutoMapper;
using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Domain.Entities;
using SurveyApp.Domain.Interfaces;

namespace SurveyApp.Application.Features.Categories.Commands.CreateCategory;

/// <summary>
/// Handler for creating a new survey category.
/// Namespace and permission validation is handled by NamespaceValidationBehavior pipeline.
/// </summary>
public class CreateCategoryCommandHandler(
    ISurveyCategoryRepository categoryRepository,
    IUnitOfWork unitOfWork,
    INamespaceCommandContext commandContext,
    IMapper mapper
) : IRequestHandler<CreateCategoryCommand, Result<SurveyCategoryDto>>
{
    private readonly ISurveyCategoryRepository _categoryRepository = categoryRepository;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;
    private readonly INamespaceCommandContext _commandContext = commandContext;
    private readonly IMapper _mapper = mapper;

    public async Task<Result<SurveyCategoryDto>> Handle(
        CreateCategoryCommand request,
        CancellationToken cancellationToken
    )
    {
        // Context is validated by NamespaceValidationBehavior pipeline
        var ctx = _commandContext.Context!;

        // Check for duplicate name
        if (
            await _categoryRepository.ExistsByNameAsync(
                ctx.NamespaceId,
                request.Name,
                cancellationToken: cancellationToken
            )
        )
        {
            return Result<SurveyCategoryDto>.Failure($"Errors.CategoryNameExists|{request.Name}");
        }

        // Get the next display order
        var maxOrder = await _categoryRepository.GetMaxDisplayOrderAsync(
            ctx.NamespaceId,
            cancellationToken
        );

        // Create the category
        var category = SurveyCategory.Create(
            ctx.NamespaceId,
            request.Name,
            ctx.UserId,
            request.LanguageCode,
            request.Description,
            request.Color,
            request.Icon
        );

        category.SetDisplayOrder(maxOrder + 1);

        _categoryRepository.Add(category);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Retrieve the category with translations for mapping
        var createdCategory = await _categoryRepository.GetByIdAsync(
            category.Id,
            cancellationToken
        );

        var dto = _mapper.Map<SurveyCategoryDto>(createdCategory);
        return Result<SurveyCategoryDto>.Success(dto);
    }
}
