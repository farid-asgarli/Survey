using FluentValidation;
using Microsoft.Extensions.Localization;
using SurveyApp.Application.Features.Themes.Commands.DuplicateTheme;

namespace SurveyApp.Application.Validators.Themes;

public class DuplicateThemeCommandValidator : AbstractValidator<DuplicateThemeCommand>
{
    public DuplicateThemeCommandValidator(
        IStringLocalizer<DuplicateThemeCommandValidator> localizer
    )
    {
        RuleFor(x => x.ThemeId).NotEmpty().WithMessage(localizer["Validation.Theme.IdRequired"]);

        RuleFor(x => x.NewName)
            .NotEmpty()
            .WithMessage(localizer["Validation.Theme.NewNameRequired"])
            .MaximumLength(100)
            .WithMessage(localizer["Validation.Theme.NameMaxLength"]);
    }
}
