using FluentValidation;
using Microsoft.Extensions.Localization;
using SurveyApp.Application.DTOs;
using SurveyApp.Application.Features.Responses.Commands;

namespace SurveyApp.Application.Validators.Responses;

/// <summary>
/// Validator for ExportResponsesCommand.
/// </summary>
public class ExportResponsesCommandValidator : AbstractValidator<ExportResponsesCommand>
{
    public ExportResponsesCommandValidator(
        IStringLocalizer<ExportResponsesCommandValidator> localizer
    )
    {
        RuleFor(x => x.SurveyId).NotEmpty().WithMessage(localizer["Validation.Survey.IdRequired"]);

        RuleFor(x => x.Format).IsInEnum().WithMessage(localizer["Validation.Export.InvalidFormat"]);

        When(
            x => x.Filter != null,
            () =>
            {
                RuleFor(x => x.Filter!.DateRange)
                    .Must(BeValidDateRange!)
                    .When(x => x.Filter!.DateRange != null)
                    .WithMessage(localizer["Validation.Export.InvalidDateRange"]);

                RuleFor(x => x.Filter!.RespondentEmail)
                    .MaximumLength(256)
                    .When(x => !string.IsNullOrEmpty(x.Filter!.RespondentEmail))
                    .WithMessage(localizer["Validation.Export.RespondentEmailMaxLength"]);
            }
        );

        RuleFor(x => x.TimezoneId)
            .Must(BeValidTimezone!)
            .When(x => !string.IsNullOrEmpty(x.TimezoneId))
            .WithMessage(localizer["Validation.Export.InvalidTimezone"]);

        RuleForEach(x => x.QuestionIds)
            .NotEmpty()
            .When(x => x.QuestionIds != null && x.QuestionIds.Count != 0)
            .WithMessage(localizer["Validation.Export.QuestionIdsInvalid"]);
    }

    private static bool BeValidDateRange(DateRange dateRange)
    {
        if (dateRange.StartDate.HasValue && dateRange.EndDate.HasValue)
        {
            return dateRange.EndDate >= dateRange.StartDate;
        }
        return true;
    }

    private static bool BeValidTimezone(string timezoneId)
    {
        try
        {
            TimeZoneInfo.FindSystemTimeZoneById(timezoneId);
            return true;
        }
        catch (TimeZoneNotFoundException)
        {
            return false;
        }
    }
}
