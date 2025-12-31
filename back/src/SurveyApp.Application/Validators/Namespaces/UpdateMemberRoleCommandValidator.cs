using FluentValidation;
using Microsoft.Extensions.Localization;
using SurveyApp.Application.Features.Namespaces.Commands.UpdateMemberRole;
using SurveyApp.Domain.Enums;

namespace SurveyApp.Application.Validators.Namespaces;

/// <summary>
/// Validator for UpdateMemberRoleCommand.
/// </summary>
public class UpdateMemberRoleCommandValidator : AbstractValidator<UpdateMemberRoleCommand>
{
    public UpdateMemberRoleCommandValidator(
        IStringLocalizer<UpdateMemberRoleCommandValidator> localizer
    )
    {
        RuleFor(x => x.NamespaceId)
            .NotEmpty()
            .WithMessage(localizer["Validation.Namespace.IdRequired"]);

        RuleFor(x => x.MembershipId)
            .NotEmpty()
            .WithMessage(localizer["Validation.Namespace.MembershipIdRequired"]);

        RuleFor(x => x.Role)
            .IsInEnum()
            .WithMessage(localizer["Validation.Namespace.InvalidRole"])
            .Must(role => role != NamespaceRole.Owner)
            .WithMessage(localizer["Validation.Namespace.CannotAssignOwner"]);
    }
}
