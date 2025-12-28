using FluentValidation;
using SurveyApp.Application.Features.SurveyLinks.Commands.GenerateBulkLinks;

namespace SurveyApp.Application.Validators.SurveyLinks;

/// <summary>
/// Validator for GenerateBulkLinksCommand.
/// </summary>
public class GenerateBulkLinksCommandValidator : AbstractValidator<GenerateBulkLinksCommand>
{
    private const int MaxBulkLinks = 1000;

    public GenerateBulkLinksCommandValidator()
    {
        RuleFor(x => x.SurveyId).NotEmpty().WithMessage("Survey ID is required.");

        RuleFor(x => x.Count)
            .GreaterThan(0)
            .WithMessage("Count must be greater than 0.")
            .LessThanOrEqualTo(MaxBulkLinks)
            .WithMessage($"Cannot generate more than {MaxBulkLinks} links at once.");

        RuleFor(x => x.NamePrefix)
            .MaximumLength(90)
            .WithMessage("Name prefix cannot exceed 90 characters (10 reserved for numbering).")
            .When(x => !string.IsNullOrEmpty(x.NamePrefix));

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
    }
}
