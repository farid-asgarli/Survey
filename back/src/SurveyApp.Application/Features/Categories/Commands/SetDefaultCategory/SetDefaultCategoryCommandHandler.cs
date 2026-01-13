using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Domain.Interfaces;

namespace SurveyApp.Application.Features.Categories.Commands.SetDefaultCategory;

/// <summary>
/// Handler for setting a category as the default.
/// </summary>
public class SetDefaultCategoryCommandHandler(
    ISurveyCategoryRepository categoryRepository,
    IUnitOfWork unitOfWork,
    INamespaceCommandContext commandContext
) : IRequestHandler<SetDefaultCategoryCommand, Result<Unit>>
{
    private readonly ISurveyCategoryRepository _categoryRepository = categoryRepository;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;
    private readonly INamespaceCommandContext _commandContext = commandContext;

    public async Task<Result<Unit>> Handle(
        SetDefaultCategoryCommand request,
        CancellationToken cancellationToken
    )
    {
        // Context is validated by NamespaceValidationBehavior pipeline
        var ctx = _commandContext.Context!;

        // Retrieve the category to set as default
        var category = await _categoryRepository.GetByIdForUpdateAsync(
            request.CategoryId,
            cancellationToken
        );

        if (category == null)
        {
            return Result<Unit>.Failure("Errors.CategoryNotFound");
        }

        // Verify it belongs to the current namespace
        if (category.NamespaceId != ctx.NamespaceId)
        {
            return Result<Unit>.Failure("Errors.CategoryNotFound");
        }

        // If already default, nothing to do
        if (category.IsDefault)
        {
            return Result<Unit>.Success(Unit.Value);
        }

        // Clear the current default if any
        var currentDefault = await _categoryRepository.GetDefaultByNamespaceIdForUpdateAsync(
            ctx.NamespaceId,
            cancellationToken
        );

        currentDefault?.ClearDefault();

        // Set the new default
        category.SetAsDefault();

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<Unit>.Success(Unit.Value);
    }
}
