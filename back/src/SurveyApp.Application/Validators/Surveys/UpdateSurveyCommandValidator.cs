using FluentValidation;
using Microsoft.Extensions.Localization;
using SurveyApp.Application.Features.Surveys.Commands.UpdateSurvey;

namespace SurveyApp.Application.Validators.Surveys;

public class UpdateSurveyCommandValidator : AbstractValidator<UpdateSurveyCommand>
{
    public UpdateSurveyCommandValidator(IStringLocalizer<UpdateSurveyCommandValidator> localizer)
    {
        RuleFor(x => x.SurveyId).NotEmpty().WithMessage(localizer["Validation.Survey.IdRequired"]);

        RuleFor(x => x.Title)
            .NotEmpty()
            .WithMessage(localizer["Validation.Survey.TitleRequired"])
            .MinimumLength(3)
            .WithMessage(localizer["Validation.Survey.TitleMinLength"])
            .MaximumLength(200)
            .WithMessage(localizer["Validation.Survey.TitleMaxLength"]);

        RuleFor(x => x.Description)
            .MaximumLength(2000)
            .WithMessage(localizer["Validation.Description.MaxLength"])
            .When(x => !string.IsNullOrEmpty(x.Description));

        RuleFor(x => x.WelcomeMessage)
            .MaximumLength(1000)
            .WithMessage(localizer["Validation.WelcomeMessage.MaxLength"])
            .When(x => !string.IsNullOrEmpty(x.WelcomeMessage));

        RuleFor(x => x.ThankYouMessage)
            .MaximumLength(1000)
            .WithMessage(localizer["Validation.ThankYouMessage.MaxLength"])
            .When(x => !string.IsNullOrEmpty(x.ThankYouMessage));

        RuleFor(x => x.MaxResponses)
            .GreaterThan(0)
            .WithMessage(localizer["Validation.MaxResponses.GreaterThanZero"])
            .When(x => x.MaxResponses.HasValue);

        RuleFor(x => x.StartsAt)
            .LessThan(x => x.EndsAt)
            .WithMessage(localizer["Validation.StartDate.BeforeEndDate"])
            .When(x => x.StartsAt.HasValue && x.EndsAt.HasValue);
    }
}
