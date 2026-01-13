using FluentValidation;
using Microsoft.Extensions.Localization;
using SurveyApp.Application.Features.Categories.Commands.CreateCategory;

namespace SurveyApp.Application.Validators.Categories;

public class CreateCategoryCommandValidator : AbstractValidator<CreateCategoryCommand>
{
    public CreateCategoryCommandValidator(
        IStringLocalizer<CreateCategoryCommandValidator> localizer
    )
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .WithMessage(localizer["Validation.Category.NameRequired"])
            .MinimumLength(1)
            .WithMessage(localizer["Validation.Category.NameMinLength"])
            .MaximumLength(100)
            .WithMessage(localizer["Validation.Category.NameMaxLength"]);

        RuleFor(x => x.Description)
            .MaximumLength(500)
            .WithMessage(localizer["Validation.Description.MaxLength500"])
            .When(x => !string.IsNullOrEmpty(x.Description));

        RuleFor(x => x.Color)
            .Matches(@"^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3}|[A-Fa-f0-9]{8})$")
            .WithMessage(localizer["Validation.Category.ColorInvalidFormat"])
            .When(x => !string.IsNullOrEmpty(x.Color));

        RuleFor(x => x.Icon)
            .MaximumLength(50)
            .WithMessage(localizer["Validation.Category.IconMaxLength"])
            .When(x => !string.IsNullOrEmpty(x.Icon));

        RuleFor(x => x.LanguageCode)
            .NotEmpty()
            .WithMessage(localizer["Validation.LanguageCode.Required"])
            .MaximumLength(10)
            .WithMessage(localizer["Validation.LanguageCode.MaxLength"]);
    }
}
