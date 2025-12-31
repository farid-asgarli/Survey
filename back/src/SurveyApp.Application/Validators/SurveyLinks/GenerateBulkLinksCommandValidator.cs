using FluentValidation;
using Microsoft.Extensions.Localization;
using SurveyApp.Application.Features.SurveyLinks.Commands.GenerateBulkLinks;

namespace SurveyApp.Application.Validators.SurveyLinks;

/// <summary>
/// Validator for GenerateBulkLinksCommand.
/// </summary>
public class GenerateBulkLinksCommandValidator : AbstractValidator<GenerateBulkLinksCommand>
{
    private const int MaxBulkLinks = 1000;

    public GenerateBulkLinksCommandValidator(
        IStringLocalizer<GenerateBulkLinksCommandValidator> localizer
    )
    {
        RuleFor(x => x.SurveyId).NotEmpty().WithMessage(localizer["Validation.Survey.IdRequired"]);

        RuleFor(x => x.Count)
            .GreaterThan(0)
            .WithMessage(localizer["Validation.BulkLinks.CountGreaterThanZero"])
            .LessThanOrEqualTo(MaxBulkLinks)
            .WithMessage(localizer["Validation.BulkLinks.MaxCountExceeded", MaxBulkLinks]);

        RuleFor(x => x.NamePrefix)
            .MaximumLength(90)
            .WithMessage(localizer["Validation.BulkLinks.NamePrefixMaxLength"])
            .When(x => !string.IsNullOrEmpty(x.NamePrefix));

        RuleFor(x => x.Source)
            .MaximumLength(100)
            .WithMessage(localizer["Validation.SurveyLink.SourceMaxLength"])
            .When(x => !string.IsNullOrEmpty(x.Source));

        RuleFor(x => x.Medium)
            .MaximumLength(100)
            .WithMessage(localizer["Validation.SurveyLink.MediumMaxLength"])
            .When(x => !string.IsNullOrEmpty(x.Medium));

        RuleFor(x => x.Campaign)
            .MaximumLength(100)
            .WithMessage(localizer["Validation.SurveyLink.CampaignMaxLength"])
            .When(x => !string.IsNullOrEmpty(x.Campaign));

        RuleFor(x => x.ExpiresAt)
            .GreaterThan(DateTime.UtcNow)
            .WithMessage(localizer["Validation.ExpiresAt.FutureDate"])
            .When(x => x.ExpiresAt.HasValue);
    }
}
