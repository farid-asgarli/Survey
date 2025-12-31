using FluentValidation;
using Microsoft.Extensions.Localization;
using SurveyApp.Application.Features.QuestionLogic.Commands.RemoveQuestionLogic;

namespace SurveyApp.Application.Validators.QuestionLogic;

public class RemoveQuestionLogicCommandValidator : AbstractValidator<RemoveQuestionLogicCommand>
{
    public RemoveQuestionLogicCommandValidator(
        IStringLocalizer<RemoveQuestionLogicCommandValidator> localizer
    )
    {
        RuleFor(x => x.SurveyId).NotEmpty().WithMessage(localizer["Validation.Survey.IdRequired"]);

        RuleFor(x => x.QuestionId)
            .NotEmpty()
            .WithMessage(localizer["Validation.QuestionIdRequired"]);

        RuleFor(x => x.LogicId)
            .NotEmpty()
            .WithMessage(localizer["Validation.QuestionLogic.LogicIdRequired"]);
    }
}
