using FluentValidation;
using Microsoft.Extensions.Localization;
using SurveyApp.Application.Features.SurveyLinks.Commands.UpdateSurveyLink;

namespace SurveyApp.Application.Validators.SurveyLinks;

/// <summary>
/// Validator for UpdateSurveyLinkCommand.
/// </summary>
public class UpdateSurveyLinkCommandValidator : AbstractValidator<UpdateSurveyLinkCommand>
{
    public UpdateSurveyLinkCommandValidator(
        IStringLocalizer<UpdateSurveyLinkCommandValidator> localizer
    )
    {
        RuleFor(x => x.SurveyId).NotEmpty().WithMessage(localizer["Validation.Survey.IdRequired"]);

        RuleFor(x => x.LinkId)
            .NotEmpty()
            .WithMessage(localizer["Validation.SurveyLink.IdRequired"]);

        RuleFor(x => x.Name)
            .MaximumLength(100)
            .WithMessage(localizer["Validation.SurveyLink.NameMaxLength"])
            .When(x => !string.IsNullOrEmpty(x.Name));

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

        RuleFor(x => x.MaxUses)
            .GreaterThan(0)
            .WithMessage(localizer["Validation.MaxUses.GreaterThanZero"])
            .When(x => x.MaxUses.HasValue);

        RuleFor(x => x.Password)
            .MinimumLength(4)
            .WithMessage(localizer["Validation.Password.MinLength4"])
            .MaximumLength(50)
            .WithMessage(localizer["Validation.Password.MaxLength50"])
            .When(x => !string.IsNullOrEmpty(x.Password));
    }
}
