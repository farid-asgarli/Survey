using FluentValidation;

namespace SurveyApp.Application.Features.Nps.Queries.GetSurveyNps;

/// <summary>
/// Validator for GetSurveyNpsQuery.
/// </summary>
public class GetSurveyNpsQueryValidator : AbstractValidator<GetSurveyNpsQuery>
{
    public GetSurveyNpsQueryValidator()
    {
        RuleFor(x => x.SurveyId).NotEmpty().WithMessage("Validation.SurveyIdRequired");
    }
}
