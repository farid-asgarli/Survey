using FluentValidation;
using Microsoft.Extensions.Localization;
using SurveyApp.Application.Features.Templates.Commands.CreateSurveyFromTemplate;

namespace SurveyApp.Application.Validators.Templates;

public class CreateSurveyFromTemplateCommandValidator
    : AbstractValidator<CreateSurveyFromTemplateCommand>
{
    public CreateSurveyFromTemplateCommandValidator(
        IStringLocalizer<CreateSurveyFromTemplateCommandValidator> localizer
    )
    {
        RuleFor(x => x.TemplateId)
            .NotEmpty()
            .WithMessage(localizer["Validation.Template.IdRequired"]);

        RuleFor(x => x.SurveyTitle)
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
    }
}
