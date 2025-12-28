using FluentValidation;
using SurveyApp.Application.Features.RecurringSurveys.Commands.UpdateRecurringSurvey;
using SurveyApp.Domain.Enums;

namespace SurveyApp.Application.Validators.RecurringSurveys;

/// <summary>
/// Validator for UpdateRecurringSurveyCommand.
/// </summary>
public class UpdateRecurringSurveyCommandValidator : AbstractValidator<UpdateRecurringSurveyCommand>
{
    public UpdateRecurringSurveyCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty().WithMessage("Recurring survey ID is required.");

        RuleFor(x => x.Name)
            .NotEmpty()
            .WithMessage("Name is required.")
            .MinimumLength(3)
            .WithMessage("Name must be at least 3 characters.")
            .MaximumLength(200)
            .WithMessage("Name cannot exceed 200 characters.");

        RuleFor(x => x.TimezoneId)
            .NotEmpty()
            .WithMessage("Timezone ID is required.")
            .MaximumLength(100)
            .WithMessage("Timezone ID cannot exceed 100 characters.");

        RuleFor(x => x.DaysOfWeek)
            .NotEmpty()
            .WithMessage("Days of week are required for weekly pattern.")
            .When(x => x.Pattern == RecurrencePattern.Weekly);

        RuleFor(x => x.DayOfMonth)
            .NotNull()
            .WithMessage("Day of month is required for monthly pattern.")
            .InclusiveBetween(1, 31)
            .WithMessage("Day of month must be between 1 and 31.")
            .When(x => x.Pattern == RecurrencePattern.Monthly);

        RuleFor(x => x.CronExpression)
            .NotEmpty()
            .WithMessage("Cron expression is required for custom pattern.")
            .MaximumLength(100)
            .WithMessage("Cron expression cannot exceed 100 characters.")
            .When(x => x.Pattern == RecurrencePattern.Custom);

        RuleFor(x => x.RecipientEmails)
            .NotEmpty()
            .WithMessage("Recipient emails are required for static list audience.")
            .When(x => x.AudienceType == AudienceType.StaticList);

        RuleForEach(x => x.RecipientEmails)
            .EmailAddress()
            .WithMessage("'{PropertyValue}' is not a valid email address.")
            .When(x => x.RecipientEmails != null && x.RecipientEmails.Length > 0);

        RuleFor(x => x.AudienceListId)
            .NotEmpty()
            .WithMessage("Audience list ID is required for dynamic list audience.")
            .When(x => x.AudienceType == AudienceType.DynamicList);

        RuleFor(x => x.ReminderDaysAfter)
            .InclusiveBetween(1, 30)
            .WithMessage("Reminder days must be between 1 and 30.")
            .When(x => x.SendReminders);

        RuleFor(x => x.MaxReminders)
            .InclusiveBetween(1, 10)
            .WithMessage("Max reminders must be between 1 and 10.")
            .When(x => x.SendReminders);

        RuleFor(x => x.CustomSubject)
            .MaximumLength(200)
            .WithMessage("Custom subject cannot exceed 200 characters.")
            .When(x => !string.IsNullOrEmpty(x.CustomSubject));

        RuleFor(x => x.CustomMessage)
            .MaximumLength(2000)
            .WithMessage("Custom message cannot exceed 2000 characters.")
            .When(x => !string.IsNullOrEmpty(x.CustomMessage));

        RuleFor(x => x.EndsAt)
            .GreaterThan(DateTime.UtcNow)
            .WithMessage("End date must be in the future.")
            .When(x => x.EndsAt.HasValue);

        RuleFor(x => x.MaxRuns)
            .GreaterThan(0)
            .WithMessage("Max runs must be greater than 0.")
            .When(x => x.MaxRuns.HasValue);
    }
}
