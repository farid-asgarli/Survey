using FluentValidation;
using Microsoft.Extensions.Localization;
using SurveyApp.Application.Features.Namespaces.Commands.CreateNamespace;

namespace SurveyApp.Application.Validators.Namespaces;

public class CreateNamespaceCommandValidator : AbstractValidator<CreateNamespaceCommand>
{
    public CreateNamespaceCommandValidator(
        IStringLocalizer<CreateNamespaceCommandValidator> localizer
    )
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .WithMessage(localizer["Validation.Namespace.NameRequired"])
            .MinimumLength(3)
            .WithMessage(localizer["Validation.Namespace.NameMinLength"])
            .MaximumLength(100)
            .WithMessage(localizer["Validation.Namespace.NameMaxLength"]);

        RuleFor(x => x.Slug)
            .NotEmpty()
            .WithMessage(localizer["Validation.Namespace.SlugRequired"])
            .MinimumLength(3)
            .WithMessage(localizer["Validation.Namespace.SlugMinLength"])
            .MaximumLength(50)
            .WithMessage(localizer["Validation.Namespace.SlugMaxLength"])
            .Matches(@"^[a-z0-9]+(?:-[a-z0-9]+)*$")
            .WithMessage(localizer["Validation.Namespace.SlugInvalidFormat"]);

        RuleFor(x => x.Description)
            .MaximumLength(500)
            .WithMessage(localizer["Validation.Description.MaxLength500"])
            .When(x => !string.IsNullOrEmpty(x.Description));

        RuleFor(x => x.LogoUrl)
            .Must(BeAValidUrl)
            .WithMessage(localizer["Validation.Url.MustBeValid", "Logo URL"])
            .When(x => !string.IsNullOrEmpty(x.LogoUrl));
    }

    private bool BeAValidUrl(string? url)
    {
        if (string.IsNullOrEmpty(url))
            return true;
        return Uri.TryCreate(url, UriKind.Absolute, out var result)
            && (result.Scheme == Uri.UriSchemeHttp || result.Scheme == Uri.UriSchemeHttps);
    }
}
