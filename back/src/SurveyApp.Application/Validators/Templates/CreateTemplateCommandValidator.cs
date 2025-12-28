using FluentValidation;
using SurveyApp.Application.Features.Templates.Commands.CreateTemplate;

namespace SurveyApp.Application.Validators.Templates;

public class CreateTemplateCommandValidator : AbstractValidator<CreateTemplateCommand>
{
    public CreateTemplateCommandValidator()
    {
        RuleFor(x => x.Name)
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

        RuleFor(x => x.WelcomeMessage)
            .MaximumLength(1000)
            .WithMessage("Welcome message cannot exceed 1000 characters.")
            .When(x => !string.IsNullOrEmpty(x.WelcomeMessage));

        RuleFor(x => x.ThankYouMessage)
            .MaximumLength(1000)
            .WithMessage("Thank you message cannot exceed 1000 characters.")
            .When(x => !string.IsNullOrEmpty(x.ThankYouMessage));

        RuleForEach(x => x.Questions).SetValidator(new CreateTemplateQuestionDtoValidator());
    }
}

public class CreateTemplateQuestionDtoValidator : AbstractValidator<CreateTemplateQuestionDto>
{
    public CreateTemplateQuestionDtoValidator()
    {
        RuleFor(x => x.Text)
            .NotEmpty()
            .WithMessage("Question text is required.")
            .MaximumLength(500)
            .WithMessage("Question text cannot exceed 500 characters.");

        RuleFor(x => x.Description)
            .MaximumLength(1000)
            .WithMessage("Question description cannot exceed 1000 characters.")
            .When(x => !string.IsNullOrEmpty(x.Description));

        RuleFor(x => x.Type).IsInEnum().WithMessage("Invalid question type.");

        RuleFor(x => x.Order)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Question order must be non-negative.");
    }
}
