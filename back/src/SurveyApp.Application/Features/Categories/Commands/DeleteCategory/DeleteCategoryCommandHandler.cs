using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Domain.Interfaces;

namespace SurveyApp.Application.Features.Categories.Commands.DeleteCategory;

/// <summary>
/// Handler for deleting a survey category.
/// </summary>
public class DeleteCategoryCommandHandler(
    ISurveyCategoryRepository categoryRepository,
    IUnitOfWork unitOfWork,
    INamespaceCommandContext commandContext
) : IRequestHandler<DeleteCategoryCommand, Result<Unit>>
{
    private readonly ISurveyCategoryRepository _categoryRepository = categoryRepository;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;
    private readonly INamespaceCommandContext _commandContext = commandContext;

    public async Task<Result<Unit>> Handle(
        DeleteCategoryCommand request,
        CancellationToken cancellationToken
    )
    {
        // Context is validated by NamespaceValidationBehavior pipeline
        var ctx = _commandContext.Context!;

        // Retrieve the category with change tracking for deletion
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

        // Cannot delete the default category
        if (category.IsDefault)
        {
            return Result<Unit>.Failure("Errors.CannotDeleteDefaultCategory");
        }

        // Soft delete the category (surveys will have their CategoryId set to null via DB cascade)
        _categoryRepository.Remove(category);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<Unit>.Success(Unit.Value);
    }
}
