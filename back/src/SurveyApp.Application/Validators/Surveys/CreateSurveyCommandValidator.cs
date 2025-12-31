using FluentValidation;
using Microsoft.Extensions.Localization;
using SurveyApp.Application.DTOs;
using SurveyApp.Application.Features.Surveys.Commands.CreateSurvey;
using SurveyApp.Domain.ValueObjects;

namespace SurveyApp.Application.Validators.Surveys;

public class CreateSurveyCommandValidator : AbstractValidator<CreateSurveyCommand>
{
    public CreateSurveyCommandValidator(IStringLocalizer localizer)
    {
        RuleFor(x => x.Title)
            .NotEmpty()
            .WithMessage(localizer["Validation.Survey.TitleRequired"])
            .MinimumLength(3)
            .WithMessage(localizer["Validation.Survey.TitleMinLength"])
            .MaximumLength(200)
            .WithMessage(localizer["Validation.Survey.TitleMaxLength"]);

        RuleFor(x => x.Description)
            .MaximumLength(2000)
            .WithMessage(localizer["Validation.Description.MaxLength"])
            .When(x => !string.IsNullOrEmpty(x.Description));

        RuleFor(x => x.WelcomeMessage)
            .MaximumLength(1000)
            .WithMessage(localizer["Validation.WelcomeMessage.MaxLength"])
            .When(x => !string.IsNullOrEmpty(x.WelcomeMessage));

        RuleFor(x => x.ThankYouMessage)
            .MaximumLength(1000)
            .WithMessage(localizer["Validation.ThankYouMessage.MaxLength"])
            .When(x => !string.IsNullOrEmpty(x.ThankYouMessage));

        RuleFor(x => x.LanguageCode)
            .NotEmpty()
            .WithMessage(localizer["Validation.LanguageCode.Required"])
            .Length(2, 10)
            .WithMessage(localizer["Validation.LanguageCode.Length"])
            .Must(LanguageCode.IsSupported)
            .WithMessage(localizer["Validation.LanguageCode.Unsupported"]);

        RuleFor(x => x.MaxResponses)
            .GreaterThan(0)
            .WithMessage(localizer["Validation.MaxResponses.GreaterThanZero"])
            .When(x => x.MaxResponses.HasValue);

        RuleFor(x => x.StartDate)
            .LessThan(x => x.EndDate)
            .WithMessage(localizer["Validation.StartDate.BeforeEndDate"])
            .When(x => x.StartDate.HasValue && x.EndDate.HasValue);

        RuleFor(x => x.EndDate)
            .GreaterThan(DateTime.UtcNow)
            .WithMessage(localizer["Validation.EndDate.FutureDate"])
            .When(x => x.EndDate.HasValue);

        RuleForEach(x => x.Questions).SetValidator(new CreateQuestionDtoValidator(localizer));
    }
}

public class CreateQuestionDtoValidator : AbstractValidator<CreateQuestionDto>
{
    public CreateQuestionDtoValidator(IStringLocalizer localizer)
    {
        RuleFor(x => x.Text)
            .NotEmpty()
            .WithMessage(localizer["Validation.Question.TextRequired"])
            .MaximumLength(500)
            .WithMessage(localizer["Validation.Question.TextMaxLength"]);

        RuleFor(x => x.Description)
            .MaximumLength(1000)
            .WithMessage(localizer["Validation.Question.DescriptionMaxLength"])
            .When(x => !string.IsNullOrEmpty(x.Description));

        RuleFor(x => x.Type).IsInEnum().WithMessage(localizer["Validation.Question.InvalidType"]);

        RuleFor(x => x.Order)
            .GreaterThanOrEqualTo(0)
            .WithMessage(localizer["Validation.Question.OrderNonNegative"]);

        RuleFor(x => x.Settings)
            .SetValidator(new QuestionSettingsDtoValidator(localizer)!)
            .When(x => x.Settings != null);
    }
}

public class QuestionSettingsDtoValidator : AbstractValidator<QuestionSettingsDto>
{
    public QuestionSettingsDtoValidator(IStringLocalizer localizer)
    {
        RuleFor(x => x.Options)
            .Must(options => options == null || options.Count > 0)
            .WithMessage(localizer["Validation.QuestionSettings.OptionsNotEmpty"]);

        RuleFor(x => x.MinValue)
            .LessThanOrEqualTo(x => x.MaxValue)
            .WithMessage(localizer["Validation.QuestionSettings.MinValueLessThanMax"])
            .When(x => x.MinValue.HasValue && x.MaxValue.HasValue);

        RuleFor(x => x.MinLength)
            .GreaterThanOrEqualTo(0)
            .WithMessage(localizer["Validation.QuestionSettings.MinLengthNonNegative"])
            .When(x => x.MinLength.HasValue);

        RuleFor(x => x.MaxLength)
            .GreaterThanOrEqualTo(x => x.MinLength ?? 0)
            .WithMessage(localizer["Validation.QuestionSettings.MaxLengthGreaterThanMin"])
            .When(x => x.MaxLength.HasValue);

        RuleFor(x => x.MaxSelections)
            .GreaterThan(0)
            .WithMessage(localizer["Validation.QuestionSettings.MaxSelectionsGreaterThanZero"])
            .When(x => x.MaxSelections.HasValue);

        RuleFor(x => x.MaxFileSize)
            .GreaterThan(0)
            .WithMessage(localizer["Validation.QuestionSettings.MaxFileSizeGreaterThanZero"])
            .LessThanOrEqualTo(52428800)
            .WithMessage(localizer["Validation.QuestionSettings.MaxFileSizeLimit"])
            .When(x => x.MaxFileSize.HasValue);
    }
}
