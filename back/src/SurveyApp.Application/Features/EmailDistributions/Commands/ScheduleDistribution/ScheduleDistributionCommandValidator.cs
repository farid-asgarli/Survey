using FluentValidation;
using Microsoft.Extensions.Localization;

namespace SurveyApp.Application.Features.EmailDistributions.Commands.ScheduleDistribution;

public class ScheduleDistributionCommandValidator : AbstractValidator<ScheduleDistributionCommand>
{
    public ScheduleDistributionCommandValidator(
        IStringLocalizer<ScheduleDistributionCommandValidator> localizer
    )
    {
        RuleFor(x => x.DistributionId)
            .NotEmpty()
            .WithMessage(localizer["Validation.DistributionIdRequired"]);

        RuleFor(x => x.ScheduledAt)
            .GreaterThan(DateTime.UtcNow)
            .WithMessage(localizer["Validation.ScheduledTimeFuture"]);
    }
}
