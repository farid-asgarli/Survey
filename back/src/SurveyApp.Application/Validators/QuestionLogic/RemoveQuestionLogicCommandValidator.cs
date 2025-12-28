using FluentValidation;
using SurveyApp.Application.Features.QuestionLogic.Commands.RemoveQuestionLogic;

namespace SurveyApp.Application.Validators.QuestionLogic;

public class RemoveQuestionLogicCommandValidator : AbstractValidator<RemoveQuestionLogicCommand>
{
    public RemoveQuestionLogicCommandValidator()
    {
        RuleFor(x => x.SurveyId).NotEmpty().WithMessage("Survey ID is required.");

        RuleFor(x => x.QuestionId).NotEmpty().WithMessage("Question ID is required.");

        RuleFor(x => x.LogicId).NotEmpty().WithMessage("Logic ID is required.");
    }
}
