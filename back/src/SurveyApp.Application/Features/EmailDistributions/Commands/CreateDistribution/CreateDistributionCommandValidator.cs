using FluentValidation;

namespace SurveyApp.Application.Features.EmailDistributions.Commands.CreateDistribution;

public class CreateDistributionCommandValidator : AbstractValidator<CreateDistributionCommand>
{
    public CreateDistributionCommandValidator()
    {
        RuleFor(x => x.SurveyId).NotEmpty().WithMessage("Validation.SurveyIdRequired");

        RuleFor(x => x.Subject)
            .NotEmpty()
            .WithMessage("Validation.SubjectRequired")
            .MaximumLength(500)
            .WithMessage("Validation.SubjectMaxLength");

        RuleFor(x => x.Body).NotEmpty().WithMessage("Validation.BodyRequired");

        RuleFor(x => x.Recipients).NotEmpty().WithMessage("Validation.RecipientRequired");

        RuleForEach(x => x.Recipients)
            .ChildRules(recipient =>
            {
                recipient
                    .RuleFor(r => r.Email)
                    .NotEmpty()
                    .WithMessage("Validation.RecipientEmailRequired")
                    .EmailAddress()
                    .WithMessage("Validation.InvalidEmailFormat");
            });

        RuleFor(x => x.SenderEmail)
            .EmailAddress()
            .When(x => !string.IsNullOrWhiteSpace(x.SenderEmail))
            .WithMessage("Validation.InvalidSenderEmailFormat");
    }
}
