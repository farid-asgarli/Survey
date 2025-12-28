using FluentValidation;

namespace SurveyApp.Application.Features.Nps.Queries.GetQuestionNps;

/// <summary>
/// Validator for GetQuestionNpsQuery.
/// </summary>
public class GetQuestionNpsQueryValidator : AbstractValidator<GetQuestionNpsQuery>
{
    public GetQuestionNpsQueryValidator()
    {
        RuleFor(x => x.SurveyId).NotEmpty().WithMessage("Validation.SurveyIdRequired");

        RuleFor(x => x.QuestionId).NotEmpty().WithMessage("Validation.QuestionIdRequired");
    }
}
