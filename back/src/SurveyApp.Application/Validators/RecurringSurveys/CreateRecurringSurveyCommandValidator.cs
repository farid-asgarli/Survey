using FluentValidation;
using Microsoft.Extensions.Localization;
using SurveyApp.Application.Features.RecurringSurveys.Commands.CreateRecurringSurvey;
using SurveyApp.Domain.Enums;

namespace SurveyApp.Application.Validators.RecurringSurveys;

/// <summary>
/// Validator for CreateRecurringSurveyCommand.
/// </summary>
public class CreateRecurringSurveyCommandValidator : AbstractValidator<CreateRecurringSurveyCommand>
{
    public CreateRecurringSurveyCommandValidator(
        IStringLocalizer<CreateRecurringSurveyCommandValidator> localizer
    )
    {
        RuleFor(x => x.SurveyId).NotEmpty().WithMessage(localizer["Validation.Survey.IdRequired"]);

        RuleFor(x => x.Name)
            .NotEmpty()
            .WithMessage(localizer["Validation.Name.Required"])
            .MinimumLength(3)
            .WithMessage(localizer["Validation.Name.MinLength"])
            .MaximumLength(200)
            .WithMessage(localizer["Validation.Name.MaxLength"]);

        RuleFor(x => x.TimezoneId)
            .NotEmpty()
            .WithMessage(localizer["Validation.TimezoneId.Required"])
            .MaximumLength(100)
            .WithMessage(localizer["Validation.TimezoneId.MaxLength"]);

        RuleFor(x => x.DaysOfWeek)
            .NotEmpty()
            .WithMessage(localizer["Validation.RecurringSurvey.DaysOfWeekRequired"])
            .When(x => x.Pattern == RecurrencePattern.Weekly);

        RuleFor(x => x.DayOfMonth)
            .NotNull()
            .WithMessage(localizer["Validation.RecurringSurvey.DayOfMonthRequired"])
            .InclusiveBetween(1, 31)
            .WithMessage(localizer["Validation.RecurringSurvey.DayOfMonthRange"])
            .When(x => x.Pattern == RecurrencePattern.Monthly);

        RuleFor(x => x.CronExpression)
            .NotEmpty()
            .WithMessage(localizer["Validation.RecurringSurvey.CronExpressionRequired"])
            .MaximumLength(100)
            .WithMessage(localizer["Validation.RecurringSurvey.CronExpressionMaxLength"])
            .When(x => x.Pattern == RecurrencePattern.Custom);

        RuleFor(x => x.RecipientEmails)
            .NotEmpty()
            .WithMessage(localizer["Validation.RecurringSurvey.RecipientEmailsRequired"])
            .When(x => x.AudienceType == AudienceType.StaticList);

        RuleForEach(x => x.RecipientEmails)
            .EmailAddress()
            .WithMessage(localizer["Validation.Email.NotValid"])
            .When(x => x.RecipientEmails != null && x.RecipientEmails.Length > 0);

        RuleFor(x => x.AudienceListId)
            .NotEmpty()
            .WithMessage(localizer["Validation.RecurringSurvey.AudienceListIdRequired"])
            .When(x => x.AudienceType == AudienceType.DynamicList);

        RuleFor(x => x.ReminderDaysAfter)
            .InclusiveBetween(1, 30)
            .WithMessage(localizer["Validation.RecurringSurvey.ReminderDaysRange"])
            .When(x => x.SendReminders);

        RuleFor(x => x.MaxReminders)
            .InclusiveBetween(1, 10)
            .WithMessage(localizer["Validation.RecurringSurvey.MaxRemindersRange"])
            .When(x => x.SendReminders);

        RuleFor(x => x.CustomSubject)
            .MaximumLength(200)
            .WithMessage(localizer["Validation.CustomSubject.MaxLength"])
            .When(x => !string.IsNullOrEmpty(x.CustomSubject));

        RuleFor(x => x.CustomMessage)
            .MaximumLength(2000)
            .WithMessage(localizer["Validation.CustomMessage.MaxLength"])
            .When(x => !string.IsNullOrEmpty(x.CustomMessage));

        RuleFor(x => x.EndsAt)
            .GreaterThan(DateTime.UtcNow)
            .WithMessage(localizer["Validation.EndsAt.FutureDate"])
            .When(x => x.EndsAt.HasValue);

        RuleFor(x => x.MaxRuns)
            .GreaterThan(0)
            .WithMessage(localizer["Validation.MaxRuns.GreaterThanZero"])
            .When(x => x.MaxRuns.HasValue);
    }
}
