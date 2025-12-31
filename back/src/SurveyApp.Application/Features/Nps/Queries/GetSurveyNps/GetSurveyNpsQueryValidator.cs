using FluentValidation;
using Microsoft.Extensions.Localization;

namespace SurveyApp.Application.Features.Nps.Queries.GetSurveyNps;

/// <summary>
/// Validator for GetSurveyNpsQuery.
/// </summary>
public class GetSurveyNpsQueryValidator : AbstractValidator<GetSurveyNpsQuery>
{
    public GetSurveyNpsQueryValidator(IStringLocalizer<GetSurveyNpsQueryValidator> localizer)
    {
        RuleFor(x => x.SurveyId).NotEmpty().WithMessage(localizer["Validation.Survey.IdRequired"]);
    }
}
