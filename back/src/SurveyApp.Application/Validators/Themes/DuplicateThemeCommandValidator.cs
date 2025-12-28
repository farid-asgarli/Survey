using FluentValidation;
using SurveyApp.Application.Features.Themes.Commands.DuplicateTheme;

namespace SurveyApp.Application.Validators.Themes;

public class DuplicateThemeCommandValidator : AbstractValidator<DuplicateThemeCommand>
{
    public DuplicateThemeCommandValidator()
    {
        RuleFor(x => x.ThemeId).NotEmpty().WithMessage("Theme ID is required.");

        RuleFor(x => x.NewName)
            .NotEmpty()
            .WithMessage("New theme name is required.")
            .MaximumLength(100)
            .WithMessage("Theme name must not exceed 100 characters.");
    }
}
