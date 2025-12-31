using FluentValidation;
using Microsoft.Extensions.Localization;

namespace SurveyApp.Application.Features.EmailTemplates.Commands.UpdateEmailTemplate;

public class UpdateEmailTemplateCommandValidator : AbstractValidator<UpdateEmailTemplateCommand>
{
    public UpdateEmailTemplateCommandValidator(
        IStringLocalizer<UpdateEmailTemplateCommandValidator> localizer
    )
    {
        RuleFor(x => x.Id).NotEmpty().WithMessage(localizer["Validation.TemplateIdRequired"]);

        RuleFor(x => x.Name)
            .MaximumLength(200)
            .WithMessage(localizer["Validation.Name.MaxLength"])
            .When(x => !string.IsNullOrWhiteSpace(x.Name));

        RuleFor(x => x.Subject)
            .MaximumLength(500)
            .WithMessage(localizer["Validation.SubjectMaxLength"])
            .When(x => !string.IsNullOrWhiteSpace(x.Subject));

        RuleFor(x => x.Type)
            .IsInEnum()
            .WithMessage(localizer["Validation.InvalidEmailTemplateType"])
            .When(x => x.Type.HasValue);
    }
}
