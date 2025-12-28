using FluentValidation;
using SurveyApp.Application.Features.QuestionLogic.Commands.ReorderLogicPriority;

namespace SurveyApp.Application.Validators.QuestionLogic;

public class ReorderLogicPriorityCommandValidator : AbstractValidator<ReorderLogicPriorityCommand>
{
    public ReorderLogicPriorityCommandValidator()
    {
        RuleFor(x => x.SurveyId).NotEmpty().WithMessage("Survey ID is required.");

        RuleFor(x => x.QuestionId).NotEmpty().WithMessage("Question ID is required.");

        RuleFor(x => x.LogicIds).NotEmpty().WithMessage("Logic IDs are required.");

        RuleForEach(x => x.LogicIds).NotEmpty().WithMessage("Logic ID cannot be empty.");
    }
}
