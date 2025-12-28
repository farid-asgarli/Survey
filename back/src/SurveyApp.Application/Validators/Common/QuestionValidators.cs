using FluentValidation;
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
    public QuestionDtoValidator()
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
            .SetValidator(new QuestionSettingsValidator()!)
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
    public QuestionSettingsValidator()
    {
        // Options validation
        RuleFor(x => x.Options)
            .Must(options => options == null || options.Count > 0)
            .WithMessage("Options list cannot be empty if provided.");

        // Numeric range validation
        RuleFor(x => x.MinValue)
            .LessThanOrEqualTo(x => x.MaxValue)
            .WithMessage("Minimum value must be less than or equal to maximum value.")
            .When(x => x.MinValue.HasValue && x.MaxValue.HasValue);

        // Length validation
        RuleFor(x => x.MinLength)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Minimum length must be non-negative.")
            .When(x => x.MinLength.HasValue);

        RuleFor(x => x.MaxLength)
            .GreaterThanOrEqualTo(x => x.MinLength ?? 0)
            .WithMessage("Maximum length must be greater than or equal to minimum length.")
            .When(x => x.MaxLength.HasValue);

        // Selection limits
        RuleFor(x => x.MaxSelections)
            .GreaterThan(0)
            .WithMessage("Maximum selections must be greater than 0.")
            .When(x => x.MaxSelections.HasValue);

        // File upload settings
        RuleFor(x => x.MaxFileSize)
            .GreaterThan(0)
            .WithMessage("Maximum file size must be greater than 0.")
            .LessThanOrEqualTo(MaxFileSizeBytes)
            .WithMessage("Maximum file size cannot exceed 50MB.")
            .When(x => x.MaxFileSize.HasValue);
    }
}
