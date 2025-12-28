using FluentValidation;
using SurveyApp.Application.Features.Themes.Commands.DeleteTheme;

namespace SurveyApp.Application.Validators.Themes;

public class DeleteThemeCommandValidator : AbstractValidator<DeleteThemeCommand>
{
    public DeleteThemeCommandValidator()
    {
        RuleFor(x => x.ThemeId).NotEmpty().WithMessage("Theme ID is required.");
    }
}
