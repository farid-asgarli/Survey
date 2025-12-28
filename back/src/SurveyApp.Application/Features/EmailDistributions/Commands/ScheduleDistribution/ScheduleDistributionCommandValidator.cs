using FluentValidation;

namespace SurveyApp.Application.Features.EmailDistributions.Commands.ScheduleDistribution;

public class ScheduleDistributionCommandValidator : AbstractValidator<ScheduleDistributionCommand>
{
    public ScheduleDistributionCommandValidator()
    {
        RuleFor(x => x.DistributionId).NotEmpty().WithMessage("Validation.DistributionIdRequired");

        RuleFor(x => x.ScheduledAt)
            .GreaterThan(DateTime.UtcNow)
            .WithMessage("Validation.ScheduledTimeFuture");
    }
}
