using FluentValidation;
using SurveyApp.Application.Common;

namespace SurveyApp.Application.Validators.Common;

/// <summary>
/// Provides reusable validation rules for common field patterns.
/// These extension methods can be used across all validators to ensure consistent validation.
/// </summary>
public static class CommonValidationRules
{
    #region Title/Name Validation

    /// <summary>
    /// Validates a title field with standard rules (3-200 characters).
    /// </summary>
    public static IRuleBuilderOptions<T, string> ValidTitle<T>(
        this IRuleBuilder<T, string> ruleBuilder,
        string fieldName = "Title"
    )
    {
        return ruleBuilder
            .NotEmpty()
            .WithMessage(string.Format(LocalizationKeys.Validation.Common.Required, fieldName))
            .MinimumLength(3)
            .WithMessage(string.Format(LocalizationKeys.Validation.Common.MinLength, fieldName, 3))
            .MaximumLength(200)
            .WithMessage(
                string.Format(LocalizationKeys.Validation.Common.MaxLength, fieldName, 200)
            );
    }

    /// <summary>
    /// Validates a name field with standard rules (3-200 characters).
    /// </summary>
    public static IRuleBuilderOptions<T, string> ValidName<T>(
        this IRuleBuilder<T, string> ruleBuilder,
        string fieldName = "Name"
    )
    {
        return ruleBuilder.ValidTitle(fieldName);
    }

    /// <summary>
    /// Validates a name field with custom length constraints.
    /// </summary>
    public static IRuleBuilderOptions<T, string> ValidName<T>(
        this IRuleBuilder<T, string> ruleBuilder,
        int minLength,
        int maxLength,
        string fieldName = "Name"
    )
    {
        return ruleBuilder
            .NotEmpty()
            .WithMessage(string.Format(LocalizationKeys.Validation.Common.Required, fieldName))
            .MinimumLength(minLength)
            .WithMessage(
                string.Format(LocalizationKeys.Validation.Common.MinLength, fieldName, minLength)
            )
            .MaximumLength(maxLength)
            .WithMessage(
                string.Format(LocalizationKeys.Validation.Common.MaxLength, fieldName, maxLength)
            );
    }

    #endregion

    #region Description Validation

    /// <summary>
    /// Validates an optional description field (max 2000 characters by default).
    /// </summary>
    public static IRuleBuilderOptions<T, string?> ValidDescription<T>(
        this IRuleBuilder<T, string?> ruleBuilder,
        int maxLength = 2000
    )
    {
        return ruleBuilder
            .MaximumLength(maxLength)
            .WithMessage(
                string.Format(
                    LocalizationKeys.Validation.Common.MaxLength,
                    "Description",
                    maxLength
                )
            )
            .When(
                x => !string.IsNullOrEmpty((x as dynamic)?.Description),
                ApplyConditionTo.CurrentValidator
            );
    }

    /// <summary>
    /// Validates an optional description field with explicit condition.
    /// </summary>
    public static IRuleBuilderOptions<T, string?> ValidOptionalDescription<T>(
        this IRuleBuilder<T, string?> ruleBuilder,
        int maxLength = 2000
    )
    {
        return ruleBuilder
            .MaximumLength(maxLength)
            .WithMessage(
                string.Format(
                    LocalizationKeys.Validation.Common.MaxLength,
                    "Description",
                    maxLength
                )
            );
    }

    #endregion

    #region Message Validation

    /// <summary>
    /// Validates a message field (like welcome message, thank you message).
    /// </summary>
    public static IRuleBuilderOptions<T, string?> ValidMessage<T>(
        this IRuleBuilder<T, string?> ruleBuilder,
        string fieldName = "Message",
        int maxLength = 1000
    )
    {
        return ruleBuilder
            .MaximumLength(maxLength)
            .WithMessage(
                string.Format(LocalizationKeys.Validation.Common.MaxLength, fieldName, maxLength)
            );
    }

    /// <summary>
    /// Validates a welcome message field.
    /// </summary>
    public static IRuleBuilderOptions<T, string?> ValidWelcomeMessage<T>(
        this IRuleBuilder<T, string?> ruleBuilder
    )
    {
        return ruleBuilder.ValidMessage("Welcome message", 1000);
    }

    /// <summary>
    /// Validates a thank you message field.
    /// </summary>
    public static IRuleBuilderOptions<T, string?> ValidThankYouMessage<T>(
        this IRuleBuilder<T, string?> ruleBuilder
    )
    {
        return ruleBuilder.ValidMessage("Thank you message", 1000);
    }

    #endregion

    #region URL Validation

    /// <summary>
    /// Validates an optional URL field.
    /// </summary>
    public static IRuleBuilderOptions<T, string?> ValidUrl<T>(
        this IRuleBuilder<T, string?> ruleBuilder,
        string fieldName = "URL"
    )
    {
        return ruleBuilder
            .Must(BeAValidUrl)
            .WithMessage(string.Format(LocalizationKeys.Validation.Url.MustBeValid, fieldName))
            .MaximumLength(2000)
            .WithMessage(string.Format(LocalizationKeys.Validation.Url.MaxLength, fieldName));
    }

    /// <summary>
    /// Validates a required URL field.
    /// </summary>
    public static IRuleBuilderOptions<T, string> ValidRequiredUrl<T>(
        this IRuleBuilder<T, string> ruleBuilder,
        string fieldName = "URL"
    )
    {
        return ruleBuilder
            .NotEmpty()
            .WithMessage(string.Format(LocalizationKeys.Validation.Url.Required, fieldName))
            .Must(BeAValidRequiredUrl!)
            .WithMessage(string.Format(LocalizationKeys.Validation.Url.MustBeValid, fieldName))
            .MaximumLength(2000)
            .WithMessage(string.Format(LocalizationKeys.Validation.Url.MaxLength, fieldName));
    }

    private static bool BeAValidUrl(string? url)
    {
        if (string.IsNullOrEmpty(url))
            return true;

        return Uri.TryCreate(url, UriKind.Absolute, out var result)
            && (result.Scheme == Uri.UriSchemeHttp || result.Scheme == Uri.UriSchemeHttps);
    }

    private static bool BeAValidRequiredUrl(string url)
    {
        return Uri.TryCreate(url, UriKind.Absolute, out var result)
            && (result.Scheme == Uri.UriSchemeHttp || result.Scheme == Uri.UriSchemeHttps);
    }

    #endregion

    #region Email Validation

    /// <summary>
    /// Validates an email address field.
    /// </summary>
    public static IRuleBuilderOptions<T, string> ValidEmail<T>(
        this IRuleBuilder<T, string> ruleBuilder,
        string fieldName = "Email"
    )
    {
        return ruleBuilder
            .NotEmpty()
            .WithMessage(string.Format(LocalizationKeys.Validation.Common.Required, fieldName))
            .EmailAddress()
            .WithMessage(string.Format(LocalizationKeys.Validation.Email.MustBeValid, fieldName))
            .MaximumLength(254)
            .WithMessage(
                string.Format(LocalizationKeys.Validation.Common.MaxLength, fieldName, 254)
            );
    }

    /// <summary>
    /// Validates an optional email address field.
    /// </summary>
    public static IRuleBuilderOptions<T, string?> ValidOptionalEmail<T>(
        this IRuleBuilder<T, string?> ruleBuilder,
        string fieldName = "Email"
    )
    {
        return ruleBuilder
            .EmailAddress()
            .WithMessage(string.Format(LocalizationKeys.Validation.Email.MustBeValid, fieldName))
            .MaximumLength(254)
            .WithMessage(
                string.Format(LocalizationKeys.Validation.Common.MaxLength, fieldName, 254)
            );
    }

    #endregion

    #region Numeric Validation

    /// <summary>
    /// Validates a positive integer field.
    /// </summary>
    public static IRuleBuilderOptions<T, int> ValidPositiveInt<T>(
        this IRuleBuilder<T, int> ruleBuilder,
        string fieldName = "Value"
    )
    {
        return ruleBuilder
            .GreaterThan(0)
            .WithMessage(
                string.Format(LocalizationKeys.Validation.Common.GreaterThanZero, fieldName)
            );
    }

    /// <summary>
    /// Validates an optional positive integer field.
    /// </summary>
    public static IRuleBuilderOptions<T, int?> ValidOptionalPositiveInt<T>(
        this IRuleBuilder<T, int?> ruleBuilder,
        string fieldName = "Value"
    )
    {
        return ruleBuilder
            .GreaterThan(0)
            .WithMessage(
                string.Format(LocalizationKeys.Validation.Common.GreaterThanZero, fieldName)
            )
            .When(x => (x as dynamic) != null, ApplyConditionTo.CurrentValidator);
    }

    /// <summary>
    /// Validates a non-negative integer field.
    /// </summary>
    public static IRuleBuilderOptions<T, int> ValidNonNegativeInt<T>(
        this IRuleBuilder<T, int> ruleBuilder,
        string fieldName = "Value"
    )
    {
        return ruleBuilder
            .GreaterThanOrEqualTo(0)
            .WithMessage(string.Format(LocalizationKeys.Validation.Common.NonNegative, fieldName));
    }

    /// <summary>
    /// Validates an integer within a range.
    /// </summary>
    public static IRuleBuilderOptions<T, int> ValidRange<T>(
        this IRuleBuilder<T, int> ruleBuilder,
        int min,
        int max,
        string fieldName = "Value"
    )
    {
        return ruleBuilder
            .InclusiveBetween(min, max)
            .WithMessage(
                string.Format(LocalizationKeys.Validation.Common.Range, fieldName, min, max)
            );
    }

    #endregion

    #region Date Validation

    /// <summary>
    /// Validates that a date is in the future.
    /// </summary>
    public static IRuleBuilderOptions<T, DateTime> ValidFutureDate<T>(
        this IRuleBuilder<T, DateTime> ruleBuilder,
        string fieldName = "Date"
    )
    {
        return ruleBuilder
            .GreaterThan(DateTime.UtcNow)
            .WithMessage(string.Format(LocalizationKeys.Validation.Common.FutureDate, fieldName));
    }

    /// <summary>
    /// Validates that an optional date is in the future.
    /// </summary>
    public static IRuleBuilderOptions<T, DateTime?> ValidOptionalFutureDate<T>(
        this IRuleBuilder<T, DateTime?> ruleBuilder,
        string fieldName = "Date"
    )
    {
        return ruleBuilder
            .GreaterThan(DateTime.UtcNow)
            .WithMessage(string.Format(LocalizationKeys.Validation.Common.FutureDate, fieldName))
            .When(x => (x as dynamic) != null, ApplyConditionTo.CurrentValidator);
    }

    /// <summary>
    /// Validates that a start date is before an end date.
    /// </summary>
    public static IRuleBuilderOptions<T, DateTime?> ValidDateRange<T>(
        this IRuleBuilder<T, DateTime?> ruleBuilder,
        Func<T, DateTime?> endDateSelector,
        string startFieldName = "Start date",
        string endFieldName = "end date"
    )
    {
        return ruleBuilder
            .Must(
                (instance, startDate) =>
                {
                    if (!startDate.HasValue)
                        return true;
                    var endDate = endDateSelector(instance);
                    if (!endDate.HasValue)
                        return true;
                    return startDate.Value < endDate.Value;
                }
            )
            .WithMessage(
                string.Format(
                    LocalizationKeys.Validation.Common.DateRangeInvalid,
                    startFieldName,
                    endFieldName
                )
            );
    }

    #endregion

    #region GUID Validation

    /// <summary>
    /// Validates that a GUID is not empty.
    /// </summary>
    public static IRuleBuilderOptions<T, Guid> ValidGuid<T>(
        this IRuleBuilder<T, Guid> ruleBuilder,
        string fieldName = "ID"
    )
    {
        return ruleBuilder
            .NotEmpty()
            .WithMessage(string.Format(LocalizationKeys.Validation.Common.IdRequired, fieldName));
    }

    /// <summary>
    /// Validates that an optional GUID is not empty when provided.
    /// </summary>
    public static IRuleBuilderOptions<T, Guid?> ValidOptionalGuid<T>(
        this IRuleBuilder<T, Guid?> ruleBuilder,
        string fieldName = "ID"
    )
    {
        return ruleBuilder
            .NotEqual(Guid.Empty)
            .WithMessage(string.Format(LocalizationKeys.Validation.Common.IdNotEmpty, fieldName))
            .When(x => (x as dynamic) != null, ApplyConditionTo.CurrentValidator);
    }

    #endregion

    #region Collection Validation

    /// <summary>
    /// Validates that a collection is not empty.
    /// </summary>
    public static IRuleBuilderOptions<T, ICollection<TItem>> ValidNonEmptyCollection<T, TItem>(
        this IRuleBuilder<T, ICollection<TItem>> ruleBuilder,
        string fieldName = "Collection"
    )
    {
        return ruleBuilder
            .NotEmpty()
            .WithMessage(
                string.Format(LocalizationKeys.Validation.Common.NotEmptyCollection, fieldName)
            );
    }

    /// <summary>
    /// Validates that a collection has a maximum number of items.
    /// </summary>
    public static IRuleBuilderOptions<T, ICollection<TItem>> ValidMaxCount<T, TItem>(
        this IRuleBuilder<T, ICollection<TItem>> ruleBuilder,
        int maxCount,
        string fieldName = "Collection"
    )
    {
        return ruleBuilder
            .Must(x => x == null || x.Count <= maxCount)
            .WithMessage(
                string.Format(
                    LocalizationKeys.Validation.Common.MaxCollectionCount,
                    fieldName,
                    maxCount
                )
            );
    }

    #endregion

    #region Color Validation

    /// <summary>
    /// Validates a hex color code.
    /// </summary>
    public static IRuleBuilderOptions<T, string?> ValidHexColor<T>(
        this IRuleBuilder<T, string?> ruleBuilder,
        string fieldName = "Color"
    )
    {
        return ruleBuilder
            .Matches(@"^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$")
            .WithMessage(
                string.Format(LocalizationKeys.Validation.Color.InvalidHexFormat, fieldName)
            );
    }

    #endregion
}
