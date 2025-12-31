using FluentValidation;
using Microsoft.Extensions.Localization;
using SurveyApp.Application.Features.Templates.Commands.CreateTemplateFromSurvey;

namespace SurveyApp.Application.Validators.Templates;

public class CreateTemplateFromSurveyCommandValidator
    : AbstractValidator<CreateTemplateFromSurveyCommand>
{
    public CreateTemplateFromSurveyCommandValidator(
        IStringLocalizer<CreateTemplateFromSurveyCommandValidator> localizer
    )
    {
        RuleFor(x => x.SurveyId).NotEmpty().WithMessage(localizer["Validation.Survey.IdRequired"]);

        RuleFor(x => x.TemplateName)
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
    }
}
