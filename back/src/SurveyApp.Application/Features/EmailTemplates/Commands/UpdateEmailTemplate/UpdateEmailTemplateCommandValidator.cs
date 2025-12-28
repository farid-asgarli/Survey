using FluentValidation;

namespace SurveyApp.Application.Features.EmailTemplates.Commands.UpdateEmailTemplate;

public class UpdateEmailTemplateCommandValidator : AbstractValidator<UpdateEmailTemplateCommand>
{
    public UpdateEmailTemplateCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty().WithMessage("Validation.TemplateIdRequired");

        RuleFor(x => x.Name)
            .MaximumLength(200)
            .WithMessage("Validation.NameMaxLength")
            .When(x => !string.IsNullOrWhiteSpace(x.Name));

        RuleFor(x => x.Subject)
            .MaximumLength(500)
            .WithMessage("Validation.SubjectMaxLength")
            .When(x => !string.IsNullOrWhiteSpace(x.Subject));

        RuleFor(x => x.Type)
            .IsInEnum()
            .WithMessage("Validation.InvalidEmailTemplateType")
            .When(x => x.Type.HasValue);
    }
}
