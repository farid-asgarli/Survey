using SurveyApp.Domain.Common;

namespace SurveyApp.Domain.ValueObjects;

/// <summary>
/// Represents a validated ISO 639-1 language code.
/// </summary>
public sealed class LanguageCode : ValueObject
{
    /// <summary>
    /// Supported language codes (ISO 639-1).
    /// </summary>
    private static readonly HashSet<string> SupportedLanguages = new(
        StringComparer.OrdinalIgnoreCase
    )
    {
        "en", // English
        "es", // Spanish
        "fr", // French
        "de", // German
        "it", // Italian
        "pt", // Portuguese
        "nl", // Dutch
        "pl", // Polish
        "ru", // Russian
        "az", // Azerbaijani
        "zh", // Chinese
        "ja", // Japanese
        "ko", // Korean
        "ar", // Arabic
        "hi", // Hindi
        "tr", // Turkish
        "sv", // Swedish
        "da", // Danish
        "fi", // Finnish
        "no", // Norwegian
        "cs", // Czech
        "el", // Greek
        "he", // Hebrew
        "hu", // Hungarian
        "id", // Indonesian
        "ms", // Malay
        "th", // Thai
        "vi", // Vietnamese
        "uk", // Ukrainian
        "ro", // Romanian
        "bg", // Bulgarian
        "hr", // Croatian
        "sk", // Slovak
        "sl", // Slovenian
        "et", // Estonian
        "lv", // Latvian
        "lt", // Lithuanian
        "sr", // Serbian
        "ca", // Catalan
        "eu", // Basque
        "gl", // Galician
    };

    /// <summary>
    /// Gets the language code value.
    /// </summary>
    public string Value { get; }

    private LanguageCode(string value)
    {
        Value = value.ToLowerInvariant();
    }

    /// <summary>
    /// Creates a new language code from a string value.
    /// </summary>
    /// <param name="value">The ISO 639-1 language code.</param>
    /// <returns>A validated LanguageCode instance.</returns>
    /// <exception cref="ArgumentException">Thrown when the language code is invalid.</exception>
    public static LanguageCode Create(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
            throw new ArgumentException(
                "Domain.ValueObjects.LanguageCode.LanguageCodeEmpty",
                nameof(value)
            );

        var normalized = value.Trim().ToLowerInvariant();

        if (normalized.Length < 2 || normalized.Length > 5)
            throw new ArgumentException(
                "Domain.ValueObjects.LanguageCode.InvalidFormat",
                nameof(value)
            );

        // Allow codes like "en", "en-US", "zh-CN"
        var primaryCode = normalized.Split('-')[0];

        if (!SupportedLanguages.Contains(primaryCode))
            throw new ArgumentException(
                "Domain.ValueObjects.LanguageCode.UnsupportedCode",
                nameof(value)
            );

        return new LanguageCode(normalized);
    }

    /// <summary>
    /// Tries to create a language code from a string value.
    /// </summary>
    /// <param name="value">The ISO 639-1 language code.</param>
    /// <param name="languageCode">The resulting language code if valid.</param>
    /// <returns>True if the language code is valid, false otherwise.</returns>
    public static bool TryCreate(string? value, out LanguageCode? languageCode)
    {
        languageCode = null;

        if (string.IsNullOrWhiteSpace(value))
            return false;

        try
        {
            languageCode = Create(value);
            return true;
        }
        catch (ArgumentException)
        {
            return false;
        }
    }

    /// <summary>
    /// Gets the default language code (English).
    /// </summary>
    public static LanguageCode Default => new("en");

    /// <summary>
    /// Checks if a language code is supported.
    /// </summary>
    public static bool IsSupported(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
            return false;

        var primaryCode = value.Trim().ToLowerInvariant().Split('-')[0];
        return SupportedLanguages.Contains(primaryCode);
    }

    /// <summary>
    /// Gets all supported language codes.
    /// </summary>
    public static IReadOnlyCollection<string> GetSupportedLanguages() =>
        SupportedLanguages.ToList().AsReadOnly();

    /// <summary>
    /// Implicit conversion to string.
    /// </summary>
    public static implicit operator string(LanguageCode languageCode) => languageCode.Value;

    /// <summary>
    /// Explicit conversion from string.
    /// </summary>
    public static explicit operator LanguageCode(string value) => Create(value);

    public override string ToString() => Value;

    protected override IEnumerable<object?> GetEqualityComponents()
    {
        yield return Value;
    }
}
