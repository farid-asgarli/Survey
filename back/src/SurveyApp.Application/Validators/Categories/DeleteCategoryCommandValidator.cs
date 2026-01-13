using FluentValidation;
using Microsoft.Extensions.Localization;
using SurveyApp.Application.Features.Categories.Commands.DeleteCategory;

namespace SurveyApp.Application.Validators.Categories;

public class DeleteCategoryCommandValidator : AbstractValidator<DeleteCategoryCommand>
{
    public DeleteCategoryCommandValidator(
        IStringLocalizer<DeleteCategoryCommandValidator> localizer
    )
    {
        RuleFor(x => x.CategoryId)
            .NotEmpty()
            .WithMessage(localizer["Validation.Category.IdRequired"]);
    }
}
