using FluentValidation;

namespace SurveyApp.Application.Features.Nps.Queries.GetNpsTrend;

/// <summary>
/// Validator for GetNpsTrendQuery.
/// </summary>
public class GetNpsTrendQueryValidator : AbstractValidator<GetNpsTrendQuery>
{
    public GetNpsTrendQueryValidator()
    {
        RuleFor(x => x.SurveyId).NotEmpty().WithMessage("Validation.SurveyIdRequired");

        RuleFor(x => x.FromDate)
            .LessThan(x => x.ToDate)
            .WithMessage("Validation.FromDateBeforeToDate");

        RuleFor(x => x.ToDate)
            .LessThanOrEqualTo(DateTime.UtcNow.AddDays(1))
            .WithMessage("Validation.ToDateNotFuture");

        RuleFor(x => x)
            .Must(x => (x.ToDate - x.FromDate).TotalDays <= 365)
            .WithMessage("Validation.DateRangeMax365");
    }
}
