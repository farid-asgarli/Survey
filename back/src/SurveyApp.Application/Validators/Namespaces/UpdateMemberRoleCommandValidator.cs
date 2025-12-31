using FluentValidation;
using SurveyApp.Application.Features.Namespaces.Commands.UpdateMemberRole;
using SurveyApp.Domain.Enums;

namespace SurveyApp.Application.Validators.Namespaces;

/// <summary>
/// Validator for UpdateMemberRoleCommand.
/// </summary>
public class UpdateMemberRoleCommandValidator : AbstractValidator<UpdateMemberRoleCommand>
{
    public UpdateMemberRoleCommandValidator()
    {
        RuleFor(x => x.NamespaceId).NotEmpty().WithMessage("Namespace ID is required.");

        RuleFor(x => x.MembershipId).NotEmpty().WithMessage("Membership ID is required.");

        RuleFor(x => x.Role)
            .IsInEnum()
            .WithMessage("Invalid role specified.")
            .Must(role => role != NamespaceRole.Owner)
            .WithMessage(
                "Cannot assign Owner role. Ownership must be transferred through a separate process."
            );
    }
}
