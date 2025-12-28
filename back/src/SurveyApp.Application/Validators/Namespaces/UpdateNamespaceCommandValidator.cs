using FluentValidation;
using SurveyApp.Application.Features.Namespaces.Commands.UpdateNamespace;

namespace SurveyApp.Application.Validators.Namespaces;

public class UpdateNamespaceCommandValidator : AbstractValidator<UpdateNamespaceCommand>
{
    public UpdateNamespaceCommandValidator()
    {
        RuleFor(x => x.NamespaceId).NotEmpty().WithMessage("Namespace ID is required.");

        RuleFor(x => x.Name)
            .NotEmpty()
            .WithMessage("Namespace name is required.")
            .MinimumLength(3)
            .WithMessage("Namespace name must be at least 3 characters.")
            .MaximumLength(100)
            .WithMessage("Namespace name cannot exceed 100 characters.");

        RuleFor(x => x.Description)
            .MaximumLength(500)
            .WithMessage("Description cannot exceed 500 characters.")
            .When(x => !string.IsNullOrEmpty(x.Description));

        RuleFor(x => x.LogoUrl)
            .Must(BeAValidUrl)
            .WithMessage("Logo URL must be a valid URL.")
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
