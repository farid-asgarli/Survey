using FluentValidation;
using SurveyApp.Application.Features.Themes.Commands.SetDefaultTheme;

namespace SurveyApp.Application.Validators.Themes;

public class SetDefaultThemeCommandValidator : AbstractValidator<SetDefaultThemeCommand>
{
    public SetDefaultThemeCommandValidator()
    {
        RuleFor(x => x.ThemeId).NotEmpty().WithMessage("Theme ID is required.");
    }
}
