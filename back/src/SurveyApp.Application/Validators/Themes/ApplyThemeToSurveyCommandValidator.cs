using FluentValidation;
using SurveyApp.Application.Features.Themes.Commands.ApplyThemeToSurvey;

namespace SurveyApp.Application.Validators.Themes;

public class ApplyThemeToSurveyCommandValidator : AbstractValidator<ApplyThemeToSurveyCommand>
{
    public ApplyThemeToSurveyCommandValidator()
    {
        RuleFor(x => x.SurveyId).NotEmpty().WithMessage("Survey ID is required.");

        RuleFor(x => x.ThemeId).NotEmpty().WithMessage("Theme ID is required.");
    }
}
