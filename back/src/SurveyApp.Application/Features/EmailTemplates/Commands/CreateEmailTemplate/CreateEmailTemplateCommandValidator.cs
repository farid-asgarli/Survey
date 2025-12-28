using FluentValidation;

namespace SurveyApp.Application.Features.EmailTemplates.Commands.CreateEmailTemplate;

public class CreateEmailTemplateCommandValidator : AbstractValidator<CreateEmailTemplateCommand>
{
    public CreateEmailTemplateCommandValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .WithMessage("Validation.NameRequired")
            .MaximumLength(200)
            .WithMessage("Validation.NameMaxLength");

        RuleFor(x => x.Subject)
            .NotEmpty()
            .WithMessage("Validation.SubjectRequired")
            .MaximumLength(500)
            .WithMessage("Validation.SubjectMaxLength");

        RuleFor(x => x.HtmlBody).NotEmpty().WithMessage("Validation.HtmlBodyRequired");

        RuleFor(x => x.Type).IsInEnum().WithMessage("Validation.InvalidEmailTemplateType");
    }
}
