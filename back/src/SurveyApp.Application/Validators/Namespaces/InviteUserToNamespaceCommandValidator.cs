using FluentValidation;
using Microsoft.Extensions.Localization;
using SurveyApp.Application.Features.Namespaces.Commands.InviteUser;
using SurveyApp.Domain.Enums;

namespace SurveyApp.Application.Validators.Namespaces;

public class InviteUserToNamespaceCommandValidator : AbstractValidator<InviteUserToNamespaceCommand>
{
    public InviteUserToNamespaceCommandValidator(
        IStringLocalizer<InviteUserToNamespaceCommandValidator> localizer
    )
    {
        RuleFor(x => x.NamespaceId)
            .NotEmpty()
            .WithMessage(localizer["Validation.Namespace.IdRequired"]);

        RuleFor(x => x.Email)
            .NotEmpty()
            .WithMessage(localizer["Validation.Email.Required"])
            .EmailAddress()
            .WithMessage(localizer["Validation.Email.NotValid"]);

        RuleFor(x => x.Role)
            .IsInEnum()
            .WithMessage(localizer["Validation.Namespace.InvalidRole"])
            .Must(role => role != NamespaceRole.Owner)
            .WithMessage(localizer["Validation.Namespace.CannotInviteOwner"]);
    }
}
