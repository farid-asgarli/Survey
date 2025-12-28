namespace SurveyApp.Application.Common.Interfaces;

/// <summary>
/// Interface for accessing the current language context.
/// Used to resolve localized content based on Accept-Language header or explicit language selection.
/// </summary>
public interface ILanguageContext
{
    /// <summary>
    /// Gets the current language code (e.g., "en", "es", "fr").
    /// Returns null if no language preference has been set.
    /// </summary>
    string? CurrentLanguage { get; }

    /// <summary>
    /// Gets whether a language context is set.
    /// </summary>
    bool HasLanguage { get; }

    /// <summary>
    /// Sets the current language code.
    /// </summary>
    /// <param name="languageCode">The language code (e.g., "en", "es", "fr").</param>
    void SetLanguage(string languageCode);

    /// <summary>
    /// Clears the current language context.
    /// </summary>
    void Clear();

    /// <summary>
    /// Gets the language code to use, falling back to default if not set.
    /// </summary>
    /// <param name="defaultLanguage">The default language to use if none is set.</param>
    /// <returns>The current language or the default.</returns>
    string GetLanguageOrDefault(string defaultLanguage = "en");
}
