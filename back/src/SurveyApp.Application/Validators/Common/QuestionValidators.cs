using FluentValidation;
using Microsoft.Extensions.Localization;
using SurveyApp.Application.DTOs;
using SurveyApp.Application.Features.Surveys.Commands.CreateSurvey;

namespace SurveyApp.Application.Validators.Common;

/// <summary>
/// Shared validator for question DTOs used across Survey and Template validators.
/// Eliminates duplication of question validation rules.
/// </summary>
public class QuestionDtoValidator : AbstractValidator<CreateQuestionDto>
{
    /// <summary>
    /// Initializes a new instance of the question validator.
    /// </summary>
    public QuestionDtoValidator(IStringLocalizer localizer)
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
            .SetValidator(new QuestionSettingsValidator(localizer)!)
            .When(x => x.Settings != null);
    }
}

/// <summary>
/// Shared validator for question settings DTOs.
/// </summary>
public class QuestionSettingsValidator : AbstractValidator<QuestionSettingsDto>
{
    /// <summary>
    /// Maximum file size allowed (50MB).
    /// </summary>
    private const int MaxFileSizeBytes = 52428800;

    /// <summary>
    /// Initializes a new instance of the question settings validator.
    /// </summary>
    public QuestionSettingsValidator(IStringLocalizer localizer)
    {
        // Options validation
        RuleFor(x => x.Options)
            .Must(options => options == null || options.Count > 0)
            .WithMessage(localizer["Validation.QuestionSettings.OptionsNotEmpty"]);

        // Numeric range validation
        RuleFor(x => x.MinValue)
            .LessThanOrEqualTo(x => x.MaxValue)
            .WithMessage(localizer["Validation.QuestionSettings.MinValueLessThanMax"])
            .When(x => x.MinValue.HasValue && x.MaxValue.HasValue);

        // Length validation
        RuleFor(x => x.MinLength)
            .GreaterThanOrEqualTo(0)
            .WithMessage(localizer["Validation.QuestionSettings.MinLengthNonNegative"])
            .When(x => x.MinLength.HasValue);

        RuleFor(x => x.MaxLength)
            .GreaterThanOrEqualTo(x => x.MinLength ?? 0)
            .WithMessage(localizer["Validation.QuestionSettings.MaxLengthGreaterThanMin"])
            .When(x => x.MaxLength.HasValue);

        // Selection limits
        RuleFor(x => x.MaxSelections)
            .GreaterThan(0)
            .WithMessage(localizer["Validation.QuestionSettings.MaxSelectionsGreaterThanZero"])
            .When(x => x.MaxSelections.HasValue);

        // File upload settings
        RuleFor(x => x.MaxFileSize)
            .GreaterThan(0)
            .WithMessage(localizer["Validation.QuestionSettings.MaxFileSizeGreaterThanZero"])
            .LessThanOrEqualTo(MaxFileSizeBytes)
            .WithMessage(localizer["Validation.QuestionSettings.MaxFileSizeLimit"])
            .When(x => x.MaxFileSize.HasValue);
    }
}
