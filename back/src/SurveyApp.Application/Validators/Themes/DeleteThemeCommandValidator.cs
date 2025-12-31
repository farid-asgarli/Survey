using FluentValidation;
using Microsoft.Extensions.Localization;
using SurveyApp.Application.Features.Themes.Commands.DeleteTheme;

namespace SurveyApp.Application.Validators.Themes;

public class DeleteThemeCommandValidator : AbstractValidator<DeleteThemeCommand>
{
    public DeleteThemeCommandValidator(IStringLocalizer<DeleteThemeCommandValidator> localizer)
    {
        RuleFor(x => x.ThemeId).NotEmpty().WithMessage(localizer["Validation.Theme.IdRequired"]);
    }
}
