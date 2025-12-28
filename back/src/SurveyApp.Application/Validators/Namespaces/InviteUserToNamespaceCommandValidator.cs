using FluentValidation;
using SurveyApp.Application.Features.Namespaces.Commands.InviteUser;
using SurveyApp.Domain.Enums;

namespace SurveyApp.Application.Validators.Namespaces;

public class InviteUserToNamespaceCommandValidator : AbstractValidator<InviteUserToNamespaceCommand>
{
    public InviteUserToNamespaceCommandValidator()
    {
        RuleFor(x => x.NamespaceId).NotEmpty().WithMessage("Namespace ID is required.");

        RuleFor(x => x.Email)
            .NotEmpty()
            .WithMessage("Email is required.")
            .EmailAddress()
            .WithMessage("Invalid email address format.");

        RuleFor(x => x.Role)
            .IsInEnum()
            .WithMessage("Invalid role specified.")
            .Must(role => role != NamespaceRole.Owner)
            .WithMessage("Cannot invite users as Owner. Ownership must be transferred.");
    }
}
