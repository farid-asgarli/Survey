using FluentValidation;
using Microsoft.Extensions.Localization;
using SurveyApp.Application.Features.QuestionLogic.Commands.UpdateQuestionLogic;
using SurveyApp.Domain.Enums;

namespace SurveyApp.Application.Validators.QuestionLogic;

public class UpdateQuestionLogicCommandValidator : AbstractValidator<UpdateQuestionLogicCommand>
{
    public UpdateQuestionLogicCommandValidator(
        IStringLocalizer<UpdateQuestionLogicCommandValidator> localizer
    )
    {
        RuleFor(x => x.SurveyId).NotEmpty().WithMessage(localizer["Validation.Survey.IdRequired"]);

        RuleFor(x => x.QuestionId)
            .NotEmpty()
            .WithMessage(localizer["Validation.QuestionIdRequired"]);

        RuleFor(x => x.LogicId)
            .NotEmpty()
            .WithMessage(localizer["Validation.QuestionLogic.LogicIdRequired"]);

        RuleFor(x => x.SourceQuestionId)
            .NotEmpty()
            .WithMessage(localizer["Validation.QuestionLogic.SourceQuestionIdRequired"]);

        RuleFor(x => x.Operator)
            .IsInEnum()
            .WithMessage(localizer["Validation.QuestionLogic.InvalidOperator"]);

        RuleFor(x => x.ConditionValue)
            .NotEmpty()
            .When(x => RequiresConditionValue(x.Operator))
            .WithMessage(localizer["Validation.QuestionLogic.ConditionValueRequired"]);

        RuleFor(x => x.ConditionValue)
            .MaximumLength(1000)
            .WithMessage(localizer["Validation.QuestionLogic.ConditionValueMaxLength"]);

        RuleFor(x => x.Action)
            .IsInEnum()
            .WithMessage(localizer["Validation.QuestionLogic.InvalidAction"]);

        RuleFor(x => x.TargetQuestionId)
            .NotEmpty()
            .When(x => x.Action == LogicAction.JumpTo)
            .WithMessage(localizer["Validation.QuestionLogic.TargetQuestionIdRequired"]);

        RuleFor(x => x.Priority)
            .GreaterThanOrEqualTo(0)
            .WithMessage(localizer["Validation.QuestionLogic.PriorityNonNegative"]);
    }

    private static bool RequiresConditionValue(LogicOperator @operator)
    {
        return @operator
            is not (
                LogicOperator.IsEmpty
                or LogicOperator.IsNotEmpty
                or LogicOperator.IsAnswered
                or LogicOperator.IsNotAnswered
            );
    }
}
