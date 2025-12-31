using FluentValidation;
using Microsoft.Extensions.Localization;

namespace SurveyApp.Application.Features.EmailDistributions.Commands.CreateDistribution;

public class CreateDistributionCommandValidator : AbstractValidator<CreateDistributionCommand>
{
    public CreateDistributionCommandValidator(
        IStringLocalizer<CreateDistributionCommandValidator> localizer
    )
    {
        RuleFor(x => x.SurveyId).NotEmpty().WithMessage(localizer["Validation.Survey.IdRequired"]);

        RuleFor(x => x.Subject)
            .NotEmpty()
            .WithMessage(localizer["Validation.SubjectRequired"])
            .MaximumLength(500)
            .WithMessage(localizer["Validation.SubjectMaxLength"]);

        RuleFor(x => x.Body).NotEmpty().WithMessage(localizer["Validation.BodyRequired"]);

        RuleFor(x => x.Recipients)
            .NotEmpty()
            .WithMessage(localizer["Validation.RecipientRequired"]);

        RuleForEach(x => x.Recipients)
            .ChildRules(recipient =>
            {
                recipient
                    .RuleFor(r => r.Email)
                    .NotEmpty()
                    .WithMessage(localizer["Validation.RecipientEmailRequired"])
                    .EmailAddress()
                    .WithMessage(localizer["Validation.InvalidEmailFormat"]);
            });

        RuleFor(x => x.SenderEmail)
            .EmailAddress()
            .When(x => !string.IsNullOrWhiteSpace(x.SenderEmail))
            .WithMessage(localizer["Validation.InvalidSenderEmailFormat"]);
    }
}
