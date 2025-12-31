using FluentValidation;
using Microsoft.Extensions.Localization;
using SurveyApp.Application.Features.Themes.Commands.SetDefaultTheme;

namespace SurveyApp.Application.Validators.Themes;

public class SetDefaultThemeCommandValidator : AbstractValidator<SetDefaultThemeCommand>
{
    public SetDefaultThemeCommandValidator(
        IStringLocalizer<SetDefaultThemeCommandValidator> localizer
    )
    {
        RuleFor(x => x.ThemeId).NotEmpty().WithMessage(localizer["Validation.Theme.IdRequired"]);
    }
}
