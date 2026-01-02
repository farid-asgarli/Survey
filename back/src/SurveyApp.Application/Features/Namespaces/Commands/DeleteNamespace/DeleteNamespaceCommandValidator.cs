using FluentValidation;

namespace SurveyApp.Application.Features.Namespaces.Commands.DeleteNamespace;

/// <summary>
/// Validator for DeleteNamespaceCommand.
/// </summary>
public class DeleteNamespaceCommandValidator : AbstractValidator<DeleteNamespaceCommand>
{
    public DeleteNamespaceCommandValidator()
    {
        RuleFor(x => x.NamespaceId).NotEmpty().WithMessage("Validation.NamespaceIdRequired");
    }
}
