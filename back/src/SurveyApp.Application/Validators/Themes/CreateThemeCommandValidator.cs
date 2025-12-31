using FluentValidation;
using Microsoft.Extensions.Localization;
using SurveyApp.Application.Features.Themes.Commands.CreateTheme;

namespace SurveyApp.Application.Validators.Themes;

public class CreateThemeCommandValidator : AbstractValidator<CreateThemeCommand>
{
    public CreateThemeCommandValidator(IStringLocalizer<CreateThemeCommandValidator> localizer)
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .WithMessage(localizer["Validation.Theme.NameRequired"])
            .MaximumLength(100)
            .WithMessage(localizer["Validation.Theme.NameMaxLength"]);

        RuleFor(x => x.Description)
            .MaximumLength(500)
            .WithMessage(localizer["Validation.Description.MaxLength500"])
            .When(x => !string.IsNullOrEmpty(x.Description));

        // Colors validation
        When(
            x => x.Colors != null,
            () =>
            {
                RuleFor(x => x.Colors!.Primary)
                    .Matches(@"^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$")
                    .WithMessage(localizer["Validation.Color.PrimaryInvalidFormat"])
                    .When(x => !string.IsNullOrEmpty(x.Colors?.Primary));

                RuleFor(x => x.Colors!.Secondary)
                    .Matches(@"^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$")
                    .WithMessage(localizer["Validation.Color.SecondaryInvalidFormat"])
                    .When(x => !string.IsNullOrEmpty(x.Colors?.Secondary));

                RuleFor(x => x.Colors!.Background)
                    .Matches(@"^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$")
                    .WithMessage(localizer["Validation.Color.BackgroundInvalidFormat"])
                    .When(x => !string.IsNullOrEmpty(x.Colors?.Background));

                RuleFor(x => x.Colors!.Text)
                    .Matches(@"^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$")
                    .WithMessage(localizer["Validation.Color.TextInvalidFormat"])
                    .When(x => !string.IsNullOrEmpty(x.Colors?.Text));

                RuleFor(x => x.Colors!.Accent)
                    .Matches(@"^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$")
                    .WithMessage(localizer["Validation.Color.AccentInvalidFormat"])
                    .When(x => !string.IsNullOrEmpty(x.Colors?.Accent));

                RuleFor(x => x.Colors!.Error)
                    .Matches(@"^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$")
                    .WithMessage(localizer["Validation.Color.ErrorInvalidFormat"])
                    .When(x => !string.IsNullOrEmpty(x.Colors?.Error));

                RuleFor(x => x.Colors!.Success)
                    .Matches(@"^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$")
                    .WithMessage(localizer["Validation.Color.SuccessInvalidFormat"])
                    .When(x => !string.IsNullOrEmpty(x.Colors?.Success));
            }
        );

        // Typography validation
        When(
            x => x.Typography != null,
            () =>
            {
                RuleFor(x => x.Typography!.FontFamily)
                    .MaximumLength(100)
                    .WithMessage(localizer["Validation.Typography.FontFamilyMaxLength"])
                    .When(x => !string.IsNullOrEmpty(x.Typography?.FontFamily));

                RuleFor(x => x.Typography!.HeadingFontFamily)
                    .MaximumLength(100)
                    .WithMessage(localizer["Validation.Typography.HeadingFontFamilyMaxLength"])
                    .When(x => !string.IsNullOrEmpty(x.Typography?.HeadingFontFamily));

                RuleFor(x => x.Typography!.BaseFontSize)
                    .InclusiveBetween(10, 32)
                    .WithMessage(localizer["Validation.Typography.BaseFontSizeRange"]);
            }
        );

        // Layout validation
        When(
            x => x.Layout != null,
            () =>
            {
                RuleFor(x => x.Layout!.Layout)
                    .IsInEnum()
                    .WithMessage(localizer["Validation.Layout.InvalidValue"]);

                RuleFor(x => x.Layout!.BackgroundPosition)
                    .IsInEnum()
                    .WithMessage(localizer["Validation.Layout.InvalidBackgroundPosition"]);

                RuleFor(x => x.Layout!.ProgressBarStyle)
                    .IsInEnum()
                    .WithMessage(localizer["Validation.Layout.InvalidProgressBarStyle"]);

                RuleFor(x => x.Layout!.BackgroundImageUrl)
                    .MaximumLength(500)
                    .WithMessage(localizer["Validation.Layout.BackgroundImageUrlMaxLength"])
                    .Must(BeAValidUrl)
                    .WithMessage(localizer["Validation.Layout.BackgroundImageUrlInvalid"])
                    .When(x => !string.IsNullOrEmpty(x.Layout?.BackgroundImageUrl));
            }
        );

        // Branding validation
        When(
            x => x.Branding != null,
            () =>
            {
                RuleFor(x => x.Branding!.LogoUrl)
                    .MaximumLength(500)
                    .WithMessage(localizer["Validation.Branding.LogoUrlMaxLength"])
                    .Must(BeAValidUrl)
                    .WithMessage(localizer["Validation.Branding.LogoUrlInvalid"])
                    .When(x => !string.IsNullOrEmpty(x.Branding?.LogoUrl));

                RuleFor(x => x.Branding!.LogoPosition)
                    .IsInEnum()
                    .WithMessage(localizer["Validation.Branding.InvalidLogoPosition"]);
            }
        );

        // Button validation
        When(
            x => x.Button != null,
            () =>
            {
                RuleFor(x => x.Button!.Style)
                    .IsInEnum()
                    .WithMessage(localizer["Validation.Button.InvalidStyle"]);

                RuleFor(x => x.Button!.TextColor)
                    .Matches(@"^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$")
                    .WithMessage(localizer["Validation.Color.ButtonTextInvalidFormat"])
                    .When(x => !string.IsNullOrEmpty(x.Button?.TextColor));
            }
        );

        // Custom CSS validation
        RuleFor(x => x.CustomCss)
            .MaximumLength(50000)
            .WithMessage(localizer["Validation.CustomCss.MaxLength"])
            .When(x => !string.IsNullOrEmpty(x.CustomCss));
    }

    private static bool BeAValidUrl(string? url)
    {
        if (string.IsNullOrEmpty(url))
            return true;
        return Uri.TryCreate(url, UriKind.Absolute, out var uriResult)
            && (uriResult.Scheme == Uri.UriSchemeHttp || uriResult.Scheme == Uri.UriSchemeHttps);
    }
}
