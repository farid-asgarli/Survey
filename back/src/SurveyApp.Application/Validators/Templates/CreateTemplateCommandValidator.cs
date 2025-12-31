using FluentValidation;
using Microsoft.Extensions.Localization;
using SurveyApp.Application.Features.Templates.Commands.CreateTemplate;

namespace SurveyApp.Application.Validators.Templates;

public class CreateTemplateCommandValidator : AbstractValidator<CreateTemplateCommand>
{
    public CreateTemplateCommandValidator(
        IStringLocalizer<CreateTemplateCommandValidator> localizer
    )
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .WithMessage(localizer["Validation.Template.NameRequired"])
            .MinimumLength(3)
            .WithMessage(localizer["Validation.Template.NameMinLength"])
            .MaximumLength(200)
            .WithMessage(localizer["Validation.Template.NameMaxLength"]);

        RuleFor(x => x.Description)
            .MaximumLength(2000)
            .WithMessage(localizer["Validation.Description.MaxLength"])
            .When(x => !string.IsNullOrEmpty(x.Description));

        RuleFor(x => x.Category)
            .MaximumLength(100)
            .WithMessage(localizer["Validation.Category.MaxLength"])
            .When(x => !string.IsNullOrEmpty(x.Category));

        RuleFor(x => x.WelcomeMessage)
            .MaximumLength(1000)
            .WithMessage(localizer["Validation.WelcomeMessage.MaxLength"])
            .When(x => !string.IsNullOrEmpty(x.WelcomeMessage));

        RuleFor(x => x.ThankYouMessage)
            .MaximumLength(1000)
            .WithMessage(localizer["Validation.ThankYouMessage.MaxLength"])
            .When(x => !string.IsNullOrEmpty(x.ThankYouMessage));

        RuleForEach(x => x.Questions)
            .SetValidator(new CreateTemplateQuestionDtoValidator(localizer));
    }
}

public class CreateTemplateQuestionDtoValidator : AbstractValidator<CreateTemplateQuestionDto>
{
    public CreateTemplateQuestionDtoValidator(IStringLocalizer localizer)
    {
        RuleFor(x => x.Text)
            .NotEmpty()
            .WithMessage(localizer["Validation.Question.TextRequired"])
            .MaximumLength(500)
            .WithMessage(localizer["Validation.Question.TextMaxLength"]);

        RuleFor(x => x.Description)
            .MaximumLength(1000)
            .WithMessage(localizer["Validation.Question.DescriptionMaxLength"])
            .When(x => !string.IsNullOrEmpty(x.Description));

        RuleFor(x => x.Type).IsInEnum().WithMessage(localizer["Validation.Question.InvalidType"]);

        RuleFor(x => x.Order)
            .GreaterThanOrEqualTo(0)
            .WithMessage(localizer["Validation.Question.OrderNonNegative"]);
    }
}
