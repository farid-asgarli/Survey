using FluentValidation;
using SurveyApp.Application.DTOs;
using SurveyApp.Application.Features.Responses.Commands;

namespace SurveyApp.Application.Validators.Responses;

/// <summary>
/// Validator for ExportResponsesCommand.
/// </summary>
public class ExportResponsesCommandValidator : AbstractValidator<ExportResponsesCommand>
{
    public ExportResponsesCommandValidator()
    {
        RuleFor(x => x.SurveyId).NotEmpty().WithMessage("Survey ID is required.");

        RuleFor(x => x.Format)
            .IsInEnum()
            .WithMessage("Invalid export format. Valid formats are: Csv, Excel, Json.");

        When(
            x => x.Filter != null,
            () =>
            {
                RuleFor(x => x.Filter!.DateRange)
                    .Must(BeValidDateRange!)
                    .When(x => x.Filter!.DateRange != null)
                    .WithMessage("End date must be greater than or equal to start date.");

                RuleFor(x => x.Filter!.RespondentEmail)
                    .MaximumLength(256)
                    .When(x => !string.IsNullOrEmpty(x.Filter!.RespondentEmail))
                    .WithMessage("Respondent email filter cannot exceed 256 characters.");
            }
        );

        RuleFor(x => x.TimezoneId)
            .Must(BeValidTimezone!)
            .When(x => !string.IsNullOrEmpty(x.TimezoneId))
            .WithMessage("Invalid timezone ID.");

        RuleForEach(x => x.QuestionIds)
            .NotEmpty()
            .When(x => x.QuestionIds != null && x.QuestionIds.Count != 0)
            .WithMessage("Question IDs must be valid GUIDs.");
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
