using FluentValidation;
using SurveyApp.Application.Features.Responses.Commands.SubmitResponse;

namespace SurveyApp.Application.Validators.Responses;

public class SubmitSurveyResponseCommandValidator : AbstractValidator<SubmitSurveyResponseCommand>
{
    public SubmitSurveyResponseCommandValidator()
    {
        RuleFor(x => x.SurveyId).NotEmpty().WithMessage("Survey ID is required.");

        RuleFor(x => x.Answers).NotNull().WithMessage("Answers are required.");

        RuleForEach(x => x.Answers).SetValidator(new SubmitAnswerDtoValidator());
    }
}

public class SubmitAnswerDtoValidator : AbstractValidator<SubmitAnswerDto>
{
    public SubmitAnswerDtoValidator()
    {
        RuleFor(x => x.QuestionId).NotEmpty().WithMessage("Question ID is required.");

        RuleFor(x => x.Value)
            .MaximumLength(10000)
            .WithMessage("Answer value cannot exceed 10000 characters.")
            .When(x => !string.IsNullOrEmpty(x.Value));
    }
}
