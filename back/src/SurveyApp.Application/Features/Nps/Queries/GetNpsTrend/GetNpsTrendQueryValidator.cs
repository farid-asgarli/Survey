using FluentValidation;
using Microsoft.Extensions.Localization;

namespace SurveyApp.Application.Features.Nps.Queries.GetNpsTrend;

/// <summary>
/// Validator for GetNpsTrendQuery.
/// </summary>
public class GetNpsTrendQueryValidator : AbstractValidator<GetNpsTrendQuery>
{
    public GetNpsTrendQueryValidator(IStringLocalizer<GetNpsTrendQueryValidator> localizer)
    {
        RuleFor(x => x.SurveyId).NotEmpty().WithMessage(localizer["Validation.Survey.IdRequired"]);

        RuleFor(x => x.FromDate)
            .LessThan(x => x.ToDate)
            .WithMessage(localizer["Validation.FromDateBeforeToDate"]);

        RuleFor(x => x.ToDate)
            .LessThanOrEqualTo(DateTime.UtcNow.AddDays(1))
            .WithMessage(localizer["Validation.ToDateNotFuture"]);

        RuleFor(x => x)
            .Must(x => (x.ToDate - x.FromDate).TotalDays <= 365)
            .WithMessage(localizer["Validation.DateRangeMax365"]);
    }
}
