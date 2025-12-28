using FluentValidation;
using SurveyApp.Application.Features.Templates.Commands.CreateTemplateFromSurvey;

namespace SurveyApp.Application.Validators.Templates;

public class CreateTemplateFromSurveyCommandValidator
    : AbstractValidator<CreateTemplateFromSurveyCommand>
{
    public CreateTemplateFromSurveyCommandValidator()
    {
        RuleFor(x => x.SurveyId).NotEmpty().WithMessage("Survey ID is required.");

        RuleFor(x => x.TemplateName)
            .NotEmpty()
            .WithMessage("Template name is required.")
            .MinimumLength(3)
            .WithMessage("Template name must be at least 3 characters.")
            .MaximumLength(200)
            .WithMessage("Template name cannot exceed 200 characters.");

        RuleFor(x => x.Description)
            .MaximumLength(2000)
            .WithMessage("Description cannot exceed 2000 characters.")
            .When(x => !string.IsNullOrEmpty(x.Description));

        RuleFor(x => x.Category)
            .MaximumLength(100)
            .WithMessage("Category cannot exceed 100 characters.")
            .When(x => !string.IsNullOrEmpty(x.Category));
    }
}
