using FluentValidation;
using Microsoft.Extensions.Localization;

namespace SurveyApp.Application.Features.Nps.Queries.GetQuestionNps;

/// <summary>
/// Validator for GetQuestionNpsQuery.
/// </summary>
public class GetQuestionNpsQueryValidator : AbstractValidator<GetQuestionNpsQuery>
{
    public GetQuestionNpsQueryValidator(IStringLocalizer<GetQuestionNpsQueryValidator> localizer)
    {
        RuleFor(x => x.SurveyId).NotEmpty().WithMessage(localizer["Validation.Survey.IdRequired"]);

        RuleFor(x => x.QuestionId)
            .NotEmpty()
            .WithMessage(localizer["Validation.QuestionIdRequired"]);
    }
}
