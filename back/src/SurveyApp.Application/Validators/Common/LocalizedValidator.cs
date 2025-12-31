using FluentValidation;
using Microsoft.Extensions.Localization;

namespace SurveyApp.Application.Validators.Common;

/// <summary>
/// Base validator class that provides localization support for all validators.
/// </summary>
/// <typeparam name="T">The type being validated</typeparam>
/// <remarks>
/// Initializes a new instance of the localized validator.
/// </remarks>
/// <param name="localizer">The string localizer service</param>
public abstract class LocalizedValidator<T>(IStringLocalizer localizer) : AbstractValidator<T>
{
    /// <summary>
    /// Gets the string localizer for accessing localized validation messages.
    /// </summary>
    protected IStringLocalizer Localizer { get; } = localizer;
}
