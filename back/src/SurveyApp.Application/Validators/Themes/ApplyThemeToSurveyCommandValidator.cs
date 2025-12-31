using FluentValidation;
using Microsoft.Extensions.Localization;
using SurveyApp.Application.Features.Themes.Commands.ApplyThemeToSurvey;

namespace SurveyApp.Application.Validators.Themes;

public class ApplyThemeToSurveyCommandValidator : AbstractValidator<ApplyThemeToSurveyCommand>
{
    public ApplyThemeToSurveyCommandValidator(
        IStringLocalizer<ApplyThemeToSurveyCommandValidator> localizer
    )
    {
        RuleFor(x => x.SurveyId).NotEmpty().WithMessage(localizer["Validation.Survey.IdRequired"]);

        RuleFor(x => x.ThemeId).NotEmpty().WithMessage(localizer["Validation.Theme.IdRequired"]);
    }
}
