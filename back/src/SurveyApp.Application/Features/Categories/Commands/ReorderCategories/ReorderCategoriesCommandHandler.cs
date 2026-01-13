using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Domain.Interfaces;

namespace SurveyApp.Application.Features.Categories.Commands.ReorderCategories;

/// <summary>
/// Handler for reordering survey categories.
/// </summary>
public class ReorderCategoriesCommandHandler(
    ISurveyCategoryRepository categoryRepository,
    IUnitOfWork unitOfWork,
    INamespaceCommandContext commandContext
) : IRequestHandler<ReorderCategoriesCommand, Result<Unit>>
{
    private readonly ISurveyCategoryRepository _categoryRepository = categoryRepository;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;
    private readonly INamespaceCommandContext _commandContext = commandContext;

    public async Task<Result<Unit>> Handle(
        ReorderCategoriesCommand request,
        CancellationToken cancellationToken
    )
    {
        // Context is validated by NamespaceValidationBehavior pipeline
        var ctx = _commandContext.Context!;

        if (request.CategoryIds.Count == 0)
        {
            return Result<Unit>.Success(Unit.Value);
        }

        // Get all categories in the namespace with change tracking enabled
        var categories = await _categoryRepository.GetByNamespaceIdForUpdateAsync(
            ctx.NamespaceId,
            cancellationToken
        );

        var categoryDict = categories.ToDictionary(c => c.Id);

        // Verify all provided IDs belong to this namespace
        foreach (var categoryId in request.CategoryIds)
        {
            if (!categoryDict.ContainsKey(categoryId))
            {
                return Result<Unit>.Failure($"Errors.CategoryNotFound|{categoryId}");
            }
        }

        // Update display orders using the already-loaded entities (no N+1 queries)
        for (int i = 0; i < request.CategoryIds.Count; i++)
        {
            var categoryId = request.CategoryIds[i];
            if (categoryDict.TryGetValue(categoryId, out var category))
            {
                category.SetDisplayOrder(i);
            }
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<Unit>.Success(Unit.Value);
    }
}
