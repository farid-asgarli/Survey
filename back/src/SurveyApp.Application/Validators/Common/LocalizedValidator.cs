using FluentValidation;
using Microsoft.Extensions.Localization;

namespace SurveyApp.Application.Validators.Common;

/// <summary>
/// Base validator class that provides localization support for all validators.
/// </summary>
/// <typeparam name="T">The type being validated</typeparam>
public abstract class LocalizedValidator<T> : AbstractValidator<T>
{
    /// <summary>
    /// Gets the string localizer for accessing localized validation messages.
    /// </summary>
    protected IStringLocalizer Localizer { get; }

    /// <summary>
    /// Initializes a new instance of the localized validator.
    /// </summary>
    /// <param name="localizer">The string localizer service</param>
    protected LocalizedValidator(IStringLocalizer localizer)
    {
        Localizer = localizer;
    }
}
