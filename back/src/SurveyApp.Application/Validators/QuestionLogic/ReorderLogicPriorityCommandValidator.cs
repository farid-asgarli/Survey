using FluentValidation;
using Microsoft.Extensions.Localization;
using SurveyApp.Application.Features.QuestionLogic.Commands.ReorderLogicPriority;

namespace SurveyApp.Application.Validators.QuestionLogic;

public class ReorderLogicPriorityCommandValidator : AbstractValidator<ReorderLogicPriorityCommand>
{
    public ReorderLogicPriorityCommandValidator(
        IStringLocalizer<ReorderLogicPriorityCommandValidator> localizer
    )
    {
        RuleFor(x => x.SurveyId).NotEmpty().WithMessage(localizer["Validation.Survey.IdRequired"]);

        RuleFor(x => x.QuestionId)
            .NotEmpty()
            .WithMessage(localizer["Validation.QuestionIdRequired"]);

        RuleFor(x => x.LogicIds)
            .NotEmpty()
            .WithMessage(localizer["Validation.QuestionLogic.LogicIdsRequired"]);

        RuleForEach(x => x.LogicIds)
            .NotEmpty()
            .WithMessage(localizer["Validation.QuestionLogic.LogicIdNotEmpty"]);
    }
}
