using FluentValidation;
using Microsoft.Extensions.Localization;
using SurveyApp.Application.Features.Responses.Commands.SubmitResponse;

namespace SurveyApp.Application.Validators.Responses;

public class SubmitSurveyResponseCommandValidator : AbstractValidator<SubmitSurveyResponseCommand>
{
    public SubmitSurveyResponseCommandValidator(
        IStringLocalizer<SubmitSurveyResponseCommandValidator> localizer
    )
    {
        RuleFor(x => x.SurveyId).NotEmpty().WithMessage(localizer["Validation.Survey.IdRequired"]);

        RuleFor(x => x.Answers)
            .NotNull()
            .WithMessage(localizer["Validation.Response.AnswersRequired"]);

        RuleForEach(x => x.Answers).SetValidator(new SubmitAnswerDtoValidator(localizer));
    }
}

public class SubmitAnswerDtoValidator : AbstractValidator<SubmitAnswerDto>
{
    public SubmitAnswerDtoValidator(IStringLocalizer localizer)
    {
        RuleFor(x => x.QuestionId)
            .NotEmpty()
            .WithMessage(localizer["Validation.Answer.QuestionIdRequired"]);

        RuleFor(x => x.Value)
            .MaximumLength(10000)
            .WithMessage(localizer["Validation.Answer.ValueMaxLength"])
            .When(x => !string.IsNullOrEmpty(x.Value));
    }
}
