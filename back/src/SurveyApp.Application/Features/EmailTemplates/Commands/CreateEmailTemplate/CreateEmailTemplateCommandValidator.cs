using FluentValidation;
using Microsoft.Extensions.Localization;

namespace SurveyApp.Application.Features.EmailTemplates.Commands.CreateEmailTemplate;

public class CreateEmailTemplateCommandValidator : AbstractValidator<CreateEmailTemplateCommand>
{
    public CreateEmailTemplateCommandValidator(
        IStringLocalizer<CreateEmailTemplateCommandValidator> localizer
    )
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .WithMessage(localizer["Validation.Name.Required"])
            .MaximumLength(200)
            .WithMessage(localizer["Validation.Name.MaxLength"]);

        RuleFor(x => x.Subject)
            .NotEmpty()
            .WithMessage(localizer["Validation.SubjectRequired"])
            .MaximumLength(500)
            .WithMessage(localizer["Validation.SubjectMaxLength"]);

        RuleFor(x => x.HtmlBody).NotEmpty().WithMessage(localizer["Validation.HtmlBodyRequired"]);

        RuleFor(x => x.Type)
            .IsInEnum()
            .WithMessage(localizer["Validation.InvalidEmailTemplateType"]);
    }
}
