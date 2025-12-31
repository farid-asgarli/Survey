using FluentValidation;
using Microsoft.Extensions.Localization;
using SurveyApp.Application.Features.Users.Commands.RegisterUser;

namespace SurveyApp.Application.Validators.Users;

public class RegisterUserCommandValidator : AbstractValidator<RegisterUserCommand>
{
    public RegisterUserCommandValidator(IStringLocalizer<RegisterUserCommandValidator> localizer)
    {
        RuleFor(x => x.Email)
            .NotEmpty()
            .WithMessage(localizer["Validation.Email.Required"])
            .EmailAddress()
            .WithMessage(localizer["Validation.Email.NotValid"]);

        RuleFor(x => x.Password)
            .NotEmpty()
            .WithMessage(localizer["Validation.Password.Required"])
            .MinimumLength(8)
            .WithMessage(localizer["Validation.Password.MinLength"])
            .MaximumLength(100)
            .WithMessage(localizer["Validation.Password.MaxLength"])
            .Matches(@"[A-Z]")
            .WithMessage(localizer["Validation.Password.UppercaseRequired"])
            .Matches(@"[a-z]")
            .WithMessage(localizer["Validation.Password.LowercaseRequired"])
            .Matches(@"[0-9]")
            .WithMessage(localizer["Validation.Password.DigitRequired"])
            .Matches(@"[^a-zA-Z0-9]")
            .WithMessage(localizer["Validation.Password.SpecialCharRequired"]);

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
    }
}
