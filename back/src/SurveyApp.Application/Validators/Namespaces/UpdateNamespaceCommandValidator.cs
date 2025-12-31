using FluentValidation;
using Microsoft.Extensions.Localization;
using SurveyApp.Application.Features.Namespaces.Commands.UpdateNamespace;

namespace SurveyApp.Application.Validators.Namespaces;

public class UpdateNamespaceCommandValidator : AbstractValidator<UpdateNamespaceCommand>
{
    public UpdateNamespaceCommandValidator(
        IStringLocalizer<UpdateNamespaceCommandValidator> localizer
    )
    {
        RuleFor(x => x.NamespaceId)
            .NotEmpty()
            .WithMessage(localizer["Validation.Namespace.IdRequired"]);

        RuleFor(x => x.Name)
            .NotEmpty()
            .WithMessage(localizer["Validation.Namespace.NameRequired"])
            .MinimumLength(3)
            .WithMessage(localizer["Validation.Namespace.NameMinLength"])
            .MaximumLength(100)
            .WithMessage(localizer["Validation.Namespace.NameMaxLength"]);

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
