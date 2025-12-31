using FluentValidation;
using Microsoft.Extensions.Localization;
using SurveyApp.Application.Features.Users.Commands.UpdateProfile;

namespace SurveyApp.Application.Validators.Users;

public class UpdateProfileCommandValidator : AbstractValidator<UpdateProfileCommand>
{
    public UpdateProfileCommandValidator(IStringLocalizer<UpdateProfileCommandValidator> localizer)
    {
        RuleFor(x => x.FirstName)
            .NotEmpty()
            .WithMessage(localizer["Validation.FirstName.Required"])
            .MaximumLength(50)
            .WithMessage(localizer["Validation.FirstName.MaxLength"]);

        RuleFor(x => x.LastName)
            .NotEmpty()
            .WithMessage(localizer["Validation.LastName.Required"])
            .MaximumLength(50)
            .WithMessage(localizer["Validation.LastName.MaxLength"]);

        RuleFor(x => x.AvatarUrl)
            .Must(BeAValidUrl)
            .WithMessage(localizer["Validation.AvatarUrl.InvalidUrl"])
            .When(x => !string.IsNullOrEmpty(x.AvatarUrl));
    }

    private bool BeAValidUrl(string? url)
    {
        if (string.IsNullOrEmpty(url))
            return true;
        return Uri.TryCreate(url, UriKind.Absolute, out var result)
            && (result.Scheme == Uri.UriSchemeHttp || result.Scheme == Uri.UriSchemeHttps);
    }
}
