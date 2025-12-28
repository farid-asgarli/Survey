using FluentValidation;
using SurveyApp.Application.Features.QuestionLogic.Commands.UpdateQuestionLogic;
using SurveyApp.Domain.Enums;

namespace SurveyApp.Application.Validators.QuestionLogic;

public class UpdateQuestionLogicCommandValidator : AbstractValidator<UpdateQuestionLogicCommand>
{
    public UpdateQuestionLogicCommandValidator()
    {
        RuleFor(x => x.SurveyId).NotEmpty().WithMessage("Survey ID is required.");

        RuleFor(x => x.QuestionId).NotEmpty().WithMessage("Question ID is required.");

        RuleFor(x => x.LogicId).NotEmpty().WithMessage("Logic ID is required.");

        RuleFor(x => x.SourceQuestionId).NotEmpty().WithMessage("Source question ID is required.");

        RuleFor(x => x.Operator).IsInEnum().WithMessage("Invalid logic operator.");

        RuleFor(x => x.ConditionValue)
            .NotEmpty()
            .When(x => RequiresConditionValue(x.Operator))
            .WithMessage("Condition value is required for this operator.");

        RuleFor(x => x.ConditionValue)
            .MaximumLength(1000)
            .WithMessage("Condition value cannot exceed 1000 characters.");

        RuleFor(x => x.Action).IsInEnum().WithMessage("Invalid logic action.");

        RuleFor(x => x.TargetQuestionId)
            .NotEmpty()
            .When(x => x.Action == LogicAction.JumpTo)
            .WithMessage("Target question ID is required for JumpTo action.");

        RuleFor(x => x.Priority)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Priority must be non-negative.");
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
