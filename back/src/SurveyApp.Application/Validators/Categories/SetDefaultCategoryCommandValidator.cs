using FluentValidation;
using Microsoft.Extensions.Localization;
using SurveyApp.Application.Features.Categories.Commands.SetDefaultCategory;

namespace SurveyApp.Application.Validators.Categories;

public class SetDefaultCategoryCommandValidator : AbstractValidator<SetDefaultCategoryCommand>
{
    public SetDefaultCategoryCommandValidator(
        IStringLocalizer<SetDefaultCategoryCommandValidator> localizer
    )
    {
        RuleFor(x => x.CategoryId)
            .NotEmpty()
            .WithMessage(localizer["Validation.Category.IdRequired"]);
    }
}
