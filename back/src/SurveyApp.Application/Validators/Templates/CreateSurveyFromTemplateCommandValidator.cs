using FluentValidation;
using SurveyApp.Application.Features.Templates.Commands.CreateSurveyFromTemplate;

namespace SurveyApp.Application.Validators.Templates;

public class CreateSurveyFromTemplateCommandValidator
    : AbstractValidator<CreateSurveyFromTemplateCommand>
{
    public CreateSurveyFromTemplateCommandValidator()
    {
        RuleFor(x => x.TemplateId).NotEmpty().WithMessage("Template ID is required.");

        RuleFor(x => x.SurveyTitle)
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
    }
}
