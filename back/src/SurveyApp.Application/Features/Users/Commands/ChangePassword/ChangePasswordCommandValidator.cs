using FluentValidation;

namespace SurveyApp.Application.Features.Users.Commands.ChangePassword;

/// <summary>
/// Validator for ChangePasswordCommand.
/// </summary>
public class ChangePasswordCommandValidator : AbstractValidator<ChangePasswordCommand>
{
    public ChangePasswordCommandValidator()
    {
        RuleFor(x => x.CurrentPassword)
            .NotEmpty()
            .WithMessage("Validation.CurrentPasswordRequired");

        RuleFor(x => x.NewPassword)
            .NotEmpty()
            .WithMessage("Validation.NewPasswordRequired")
            .MinimumLength(8)
            .WithMessage("Validation.PasswordMinLength")
            .Matches("[A-Z]")
            .WithMessage("Validation.PasswordUppercase")
            .Matches("[a-z]")
            .WithMessage("Validation.PasswordLowercase")
            .Matches("[0-9]")
            .WithMessage("Validation.PasswordDigit")
            .Matches("[^a-zA-Z0-9]")
            .WithMessage("Validation.PasswordSpecialChar");
    }
}
