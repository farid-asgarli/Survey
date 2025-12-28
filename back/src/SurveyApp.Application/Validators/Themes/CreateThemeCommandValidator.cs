using FluentValidation;
using SurveyApp.Application.Features.Themes.Commands.CreateTheme;

namespace SurveyApp.Application.Validators.Themes;

public class CreateThemeCommandValidator : AbstractValidator<CreateThemeCommand>
{
    public CreateThemeCommandValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .WithMessage("Theme name is required.")
            .MaximumLength(100)
            .WithMessage("Theme name must not exceed 100 characters.");

        RuleFor(x => x.Description)
            .MaximumLength(500)
            .WithMessage("Description must not exceed 500 characters.")
            .When(x => !string.IsNullOrEmpty(x.Description));

        // Colors validation
        When(
            x => x.Colors != null,
            () =>
            {
                RuleFor(x => x.Colors!.Primary)
                    .Matches(@"^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$")
                    .WithMessage("Primary color must be a valid hex color code (e.g., #FF5733).")
                    .When(x => !string.IsNullOrEmpty(x.Colors?.Primary));

                RuleFor(x => x.Colors!.Secondary)
                    .Matches(@"^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$")
                    .WithMessage("Secondary color must be a valid hex color code.")
                    .When(x => !string.IsNullOrEmpty(x.Colors?.Secondary));

                RuleFor(x => x.Colors!.Background)
                    .Matches(@"^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$")
                    .WithMessage("Background color must be a valid hex color code.")
                    .When(x => !string.IsNullOrEmpty(x.Colors?.Background));

                RuleFor(x => x.Colors!.Text)
                    .Matches(@"^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$")
                    .WithMessage("Text color must be a valid hex color code.")
                    .When(x => !string.IsNullOrEmpty(x.Colors?.Text));

                RuleFor(x => x.Colors!.Accent)
                    .Matches(@"^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$")
                    .WithMessage("Accent color must be a valid hex color code.")
                    .When(x => !string.IsNullOrEmpty(x.Colors?.Accent));

                RuleFor(x => x.Colors!.Error)
                    .Matches(@"^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$")
                    .WithMessage("Error color must be a valid hex color code.")
                    .When(x => !string.IsNullOrEmpty(x.Colors?.Error));

                RuleFor(x => x.Colors!.Success)
                    .Matches(@"^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$")
                    .WithMessage("Success color must be a valid hex color code.")
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
                    .WithMessage("Font family must not exceed 100 characters.")
                    .When(x => !string.IsNullOrEmpty(x.Typography?.FontFamily));

                RuleFor(x => x.Typography!.HeadingFontFamily)
                    .MaximumLength(100)
                    .WithMessage("Heading font family must not exceed 100 characters.")
                    .When(x => !string.IsNullOrEmpty(x.Typography?.HeadingFontFamily));

                RuleFor(x => x.Typography!.BaseFontSize)
                    .InclusiveBetween(10, 32)
                    .WithMessage("Base font size must be between 10 and 32 pixels.");
            }
        );

        // Layout validation
        When(
            x => x.Layout != null,
            () =>
            {
                RuleFor(x => x.Layout!.Layout).IsInEnum().WithMessage("Invalid layout value.");

                RuleFor(x => x.Layout!.BackgroundPosition)
                    .IsInEnum()
                    .WithMessage("Invalid background position value.");

                RuleFor(x => x.Layout!.ProgressBarStyle)
                    .IsInEnum()
                    .WithMessage("Invalid progress bar style value.");

                RuleFor(x => x.Layout!.BackgroundImageUrl)
                    .MaximumLength(500)
                    .WithMessage("Background image URL must not exceed 500 characters.")
                    .Must(BeAValidUrl)
                    .WithMessage("Background image URL must be a valid URL.")
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
                    .WithMessage("Logo URL must not exceed 500 characters.")
                    .Must(BeAValidUrl)
                    .WithMessage("Logo URL must be a valid URL.")
                    .When(x => !string.IsNullOrEmpty(x.Branding?.LogoUrl));

                RuleFor(x => x.Branding!.LogoPosition)
                    .IsInEnum()
                    .WithMessage("Invalid logo position value.");
            }
        );

        // Button validation
        When(
            x => x.Button != null,
            () =>
            {
                RuleFor(x => x.Button!.Style).IsInEnum().WithMessage("Invalid button style value.");

                RuleFor(x => x.Button!.TextColor)
                    .Matches(@"^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$")
                    .WithMessage("Button text color must be a valid hex color code.")
                    .When(x => !string.IsNullOrEmpty(x.Button?.TextColor));
            }
        );

        // Custom CSS validation
        RuleFor(x => x.CustomCss)
            .MaximumLength(50000)
            .WithMessage("Custom CSS must not exceed 50,000 characters.")
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
