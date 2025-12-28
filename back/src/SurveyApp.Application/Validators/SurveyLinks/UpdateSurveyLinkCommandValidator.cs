using FluentValidation;
using SurveyApp.Application.Features.SurveyLinks.Commands.UpdateSurveyLink;

namespace SurveyApp.Application.Validators.SurveyLinks;

/// <summary>
/// Validator for UpdateSurveyLinkCommand.
/// </summary>
public class UpdateSurveyLinkCommandValidator : AbstractValidator<UpdateSurveyLinkCommand>
{
    public UpdateSurveyLinkCommandValidator()
    {
        RuleFor(x => x.SurveyId).NotEmpty().WithMessage("Survey ID is required.");

        RuleFor(x => x.LinkId).NotEmpty().WithMessage("Link ID is required.");

        RuleFor(x => x.Name)
            .MaximumLength(100)
            .WithMessage("Link name cannot exceed 100 characters.")
            .When(x => !string.IsNullOrEmpty(x.Name));

        RuleFor(x => x.Source)
            .MaximumLength(100)
            .WithMessage("Source cannot exceed 100 characters.")
            .When(x => !string.IsNullOrEmpty(x.Source));

        RuleFor(x => x.Medium)
            .MaximumLength(100)
            .WithMessage("Medium cannot exceed 100 characters.")
            .When(x => !string.IsNullOrEmpty(x.Medium));

        RuleFor(x => x.Campaign)
            .MaximumLength(100)
            .WithMessage("Campaign cannot exceed 100 characters.")
            .When(x => !string.IsNullOrEmpty(x.Campaign));

        RuleFor(x => x.ExpiresAt)
            .GreaterThan(DateTime.UtcNow)
            .WithMessage("Expiration date must be in the future.")
            .When(x => x.ExpiresAt.HasValue);

        RuleFor(x => x.MaxUses)
            .GreaterThan(0)
            .WithMessage("Maximum uses must be greater than 0.")
            .When(x => x.MaxUses.HasValue);

        RuleFor(x => x.Password)
            .MinimumLength(4)
            .WithMessage("Password must be at least 4 characters.")
            .MaximumLength(50)
            .WithMessage("Password cannot exceed 50 characters.")
            .When(x => !string.IsNullOrEmpty(x.Password));
    }
}
