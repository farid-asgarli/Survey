using FluentValidation;
using SurveyApp.Application.DTOs;
using SurveyApp.Application.Features.Surveys.Commands.CreateSurvey;

namespace SurveyApp.Application.Validators.Surveys;

public class CreateSurveyCommandValidator : AbstractValidator<CreateSurveyCommand>
{
    private static readonly string[] SupportedLanguages =
    [
        "en",
        "es",
        "fr",
        "de",
        "it",
        "pt",
        "ru",
        "zh",
        "ja",
        "ko",
        "ar",
        "hi",
        "tr",
        "pl",
        "nl",
        "sv",
        "da",
        "no",
        "fi",
        "cs",
        "uk",
    ];

    public CreateSurveyCommandValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty()
            .WithMessage("Survey title is required.")
            .MinimumLength(3)
            .WithMessage("Survey title must be at least 3 characters.")
            .MaximumLength(200)
            .WithMessage("Survey title cannot exceed 200 characters.");

        RuleFor(x => x.Description)
            .MaximumLength(2000)
            .WithMessage("Description cannot exceed 2000 characters.")
            .When(x => !string.IsNullOrEmpty(x.Description));

        RuleFor(x => x.WelcomeMessage)
            .MaximumLength(1000)
            .WithMessage("Welcome message cannot exceed 1000 characters.")
            .When(x => !string.IsNullOrEmpty(x.WelcomeMessage));

        RuleFor(x => x.ThankYouMessage)
            .MaximumLength(1000)
            .WithMessage("Thank you message cannot exceed 1000 characters.")
            .When(x => !string.IsNullOrEmpty(x.ThankYouMessage));

        RuleFor(x => x.LanguageCode)
            .NotEmpty()
            .WithMessage("Language code is required.")
            .Length(2, 10)
            .WithMessage("Language code must be between 2 and 10 characters.")
            .Must(code => SupportedLanguages.Contains(code.ToLowerInvariant()))
            .WithMessage("Invalid or unsupported language code.");

        RuleFor(x => x.MaxResponses)
            .GreaterThan(0)
            .WithMessage("Maximum responses must be greater than 0.")
            .When(x => x.MaxResponses.HasValue);

        RuleFor(x => x.StartDate)
            .LessThan(x => x.EndDate)
            .WithMessage("Start date must be before end date.")
            .When(x => x.StartDate.HasValue && x.EndDate.HasValue);

        RuleFor(x => x.EndDate)
            .GreaterThan(DateTime.UtcNow)
            .WithMessage("End date must be in the future.")
            .When(x => x.EndDate.HasValue);

        RuleForEach(x => x.Questions).SetValidator(new CreateQuestionDtoValidator());
    }
}

public class CreateQuestionDtoValidator : AbstractValidator<CreateQuestionDto>
{
    public CreateQuestionDtoValidator()
    {
        RuleFor(x => x.Text)
            .NotEmpty()
            .WithMessage("Question text is required.")
            .MaximumLength(500)
            .WithMessage("Question text cannot exceed 500 characters.");

        RuleFor(x => x.Description)
            .MaximumLength(1000)
            .WithMessage("Question description cannot exceed 1000 characters.")
            .When(x => !string.IsNullOrEmpty(x.Description));

        RuleFor(x => x.Type).IsInEnum().WithMessage("Invalid question type.");

        RuleFor(x => x.Order)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Question order must be non-negative.");

        RuleFor(x => x.Settings)
            .SetValidator(new QuestionSettingsDtoValidator()!)
            .When(x => x.Settings != null);
    }
}

public class QuestionSettingsDtoValidator : AbstractValidator<QuestionSettingsDto>
{
    public QuestionSettingsDtoValidator()
    {
        RuleFor(x => x.Options)
            .Must(options => options == null || options.Count > 0)
            .WithMessage("Options list cannot be empty if provided.");

        RuleFor(x => x.MinValue)
            .LessThanOrEqualTo(x => x.MaxValue)
            .WithMessage("Minimum value must be less than or equal to maximum value.")
            .When(x => x.MinValue.HasValue && x.MaxValue.HasValue);

        RuleFor(x => x.MinLength)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Minimum length must be non-negative.")
            .When(x => x.MinLength.HasValue);

        RuleFor(x => x.MaxLength)
            .GreaterThanOrEqualTo(x => x.MinLength ?? 0)
            .WithMessage("Maximum length must be greater than or equal to minimum length.")
            .When(x => x.MaxLength.HasValue);

        RuleFor(x => x.MaxSelections)
            .GreaterThan(0)
            .WithMessage("Maximum selections must be greater than 0.")
            .When(x => x.MaxSelections.HasValue);

        RuleFor(x => x.MaxFileSize)
            .GreaterThan(0)
            .WithMessage("Maximum file size must be greater than 0.")
            .LessThanOrEqualTo(52428800)
            .WithMessage("Maximum file size cannot exceed 50MB.")
            .When(x => x.MaxFileSize.HasValue);
    }
}
