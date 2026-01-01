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
        // Either ResponseId (new flow) or SurveyId (legacy flow) must be provided
        RuleFor(x => x)
            .Must(x => x.ResponseId.HasValue || x.SurveyId.HasValue)
            .WithMessage(localizer["Validation.Response.ResponseIdOrSurveyIdRequired"])
            .WithName("ResponseId/SurveyId");

        // If using legacy flow (no ResponseId), SurveyId is required
        RuleFor(x => x.SurveyId)
            .NotEmpty()
            .WithMessage(localizer["Validation.Survey.IdRequired"])
            .When(x => !x.ResponseId.HasValue);

        // If using new flow (ResponseId provided), it must be valid
        RuleFor(x => x.ResponseId)
            .NotEmpty()
            .WithMessage(localizer["Validation.Response.IdRequired"])
            .When(x => x.ResponseId.HasValue);

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

        // Validate text answers don't exceed max length
        RuleFor(x => x.Text)
            .MaximumLength(10000)
            .WithMessage(localizer["Validation.Answer.ValueMaxLength"])
            .When(x => !string.IsNullOrEmpty(x.Text));
    }
}
