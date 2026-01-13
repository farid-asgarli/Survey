using FluentValidation;
using Microsoft.Extensions.Localization;
using SurveyApp.Application.Features.Categories.Commands.ReorderCategories;

namespace SurveyApp.Application.Validators.Categories;

public class ReorderCategoriesCommandValidator : AbstractValidator<ReorderCategoriesCommand>
{
    public ReorderCategoriesCommandValidator(
        IStringLocalizer<ReorderCategoriesCommandValidator> localizer
    )
    {
        RuleFor(x => x.CategoryIds)
            .NotNull()
            .WithMessage(localizer["Validation.Category.CategoryIdsRequired"]);

        RuleForEach(x => x.CategoryIds)
            .NotEmpty()
            .WithMessage(localizer["Validation.Category.IdRequired"]);

        // Check for duplicate IDs
        RuleFor(x => x.CategoryIds)
            .Must(ids => ids == null || ids.Count == ids.Distinct().Count())
            .WithMessage(localizer["Validation.Category.DuplicateIdsNotAllowed"]);
    }
}
