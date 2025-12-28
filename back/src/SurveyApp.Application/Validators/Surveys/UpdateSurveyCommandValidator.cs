using FluentValidation;
using SurveyApp.Application.Features.Surveys.Commands.UpdateSurvey;

namespace SurveyApp.Application.Validators.Surveys;

public class UpdateSurveyCommandValidator : AbstractValidator<UpdateSurveyCommand>
{
    public UpdateSurveyCommandValidator()
    {
        RuleFor(x => x.SurveyId).NotEmpty().WithMessage("Survey ID is required.");

        RuleFor(x => x.Title)
            .NotEmpty()
            .WithMessage("Survey title is required.")
            .MinimumLength(3)
            .WithMessage("Survey title must be at least 3 characters.")
            .MaximumLength(200)
            .WithMessage("Survey title cannot exceed 200 characters.");

        RuleFor(x => x.Description)
            .MaximumLength(2000)
            .WithMessage("Description cannot exceed 2000 characters.")
            .When(x => !string.IsNullOrEmpty(x.Description));

        RuleFor(x => x.WelcomeMessage)
            .MaximumLength(1000)
            .WithMessage("Welcome message cannot exceed 1000 characters.")
            .When(x => !string.IsNullOrEmpty(x.WelcomeMessage));

        RuleFor(x => x.ThankYouMessage)
            .MaximumLength(1000)
            .WithMessage("Thank you message cannot exceed 1000 characters.")
            .When(x => !string.IsNullOrEmpty(x.ThankYouMessage));

        RuleFor(x => x.MaxResponses)
            .GreaterThan(0)
            .WithMessage("Maximum responses must be greater than 0.")
            .When(x => x.MaxResponses.HasValue);

        RuleFor(x => x.StartsAt)
            .LessThan(x => x.EndsAt)
            .WithMessage("Start date must be before end date.")
            .When(x => x.StartsAt.HasValue && x.EndsAt.HasValue);
    }
}
