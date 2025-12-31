namespace SurveyApp.Domain.Common;

/// <summary>
/// Manages translations for localizable entities.
/// Encapsulates common translation operations to avoid code duplication across entities.
/// </summary>
/// <typeparam name="TTranslation">The translation entity type.</typeparam>
/// <remarks>
/// Creates a new translation manager.
/// </remarks>
/// <param name="translations">The backing list of translations (must be the entity's private field).</param>
/// <param name="setDefaultLanguage">Action to update the entity's DefaultLanguage property.</param>
public class TranslationManager<TTranslation>(
    List<TTranslation> translations,
    Action<string> setDefaultLanguage
)
    where TTranslation : Translation
{
    private readonly List<TTranslation> _translations =
        translations ?? throw new ArgumentNullException(nameof(translations));
    private readonly Action<string> _setDefaultLanguage =
        setDefaultLanguage ?? throw new ArgumentNullException(nameof(setDefaultLanguage));

    /// <summary>
    /// Gets the translations collection (read-only).
    /// </summary>
    public IReadOnlyCollection<TTranslation> Translations => _translations.AsReadOnly();

    /// <summary>
    /// Gets a translation for the specified language, falling back to default if not found.
    /// </summary>
    /// <param name="languageCode">The language code, or null for default.</param>
    /// <returns>The translation, or null if no translations exist.</returns>
    public TTranslation? Get(string? languageCode)
    {
        if (string.IsNullOrWhiteSpace(languageCode))
            return GetDefault();

        return _translations.FirstOrDefault(t =>
                t.LanguageCode.Equals(languageCode, StringComparison.OrdinalIgnoreCase)
            ) ?? GetDefault();
    }

    /// <summary>
    /// Gets the default translation.
    /// </summary>
    /// <returns>The default translation, or the first translation if none is marked as default.</returns>
    public TTranslation? GetDefault()
    {
        return _translations.FirstOrDefault(t => t.IsDefault) ?? _translations.FirstOrDefault();
    }

    /// <summary>
    /// Adds a translation to the collection.
    /// If this is the first translation, it will be marked as default.
    /// </summary>
    /// <param name="translation">The translation to add.</param>
    /// <returns>True if added successfully, false if a translation for this language already exists.</returns>
    public bool Add(TTranslation translation)
    {
        if (translation == null)
            throw new ArgumentNullException(nameof(translation));

        // Check if translation for this language already exists
        if (
            _translations.Any(t =>
                t.LanguageCode.Equals(translation.LanguageCode, StringComparison.OrdinalIgnoreCase)
            )
        )
            return false;

        // First translation becomes the default
        var isFirst = !_translations.Any();
        if (isFirst)
        {
            translation.SetAsDefault();
            _setDefaultLanguage(translation.LanguageCode.ToLowerInvariant());
        }

        _translations.Add(translation);
        return true;
    }

    /// <summary>
    /// Finds an existing translation by language code.
    /// </summary>
    /// <param name="languageCode">The language code to search for.</param>
    /// <returns>The translation if found, otherwise null.</returns>
    public TTranslation? Find(string languageCode)
    {
        if (string.IsNullOrWhiteSpace(languageCode))
            return null;

        return _translations.FirstOrDefault(t =>
            t.LanguageCode.Equals(languageCode, StringComparison.OrdinalIgnoreCase)
        );
    }

    /// <summary>
    /// Removes a translation from the collection.
    /// </summary>
    /// <param name="languageCode">The language code of the translation to remove.</param>
    /// <exception cref="InvalidOperationException">Thrown when trying to remove the default translation while others exist.</exception>
    public void Remove(string languageCode)
    {
        var translation = Find(languageCode);
        if (translation == null)
            return;

        if (translation.IsDefault && _translations.Count > 1)
        {
            throw new InvalidOperationException("Domain.Translation.CannotRemoveDefaultWithOthers");
        }

        _translations.Remove(translation);

        // If we removed the default, promote a new one
        if (translation.IsDefault && _translations.Count > 0)
        {
            var newDefault = _translations.First();
            newDefault.SetAsDefault();
            _setDefaultLanguage(newDefault.LanguageCode);
        }
    }

    /// <summary>
    /// Sets a translation as the default.
    /// </summary>
    /// <param name="languageCode">The language code to set as default.</param>
    /// <exception cref="InvalidOperationException">Thrown when the translation doesn't exist.</exception>
    public void SetDefault(string languageCode)
    {
        var translation = Find(languageCode);
        if (translation == null)
        {
            throw new InvalidOperationException("Domain.Translation.NotFoundForLanguage");
        }

        // Remove default from all translations
        foreach (var t in _translations)
        {
            t.RemoveDefault();
        }

        translation.SetAsDefault();
        _setDefaultLanguage(languageCode.ToLowerInvariant());
    }

    /// <summary>
    /// Gets all available language codes.
    /// </summary>
    /// <returns>A read-only list of language codes.</returns>
    public IReadOnlyList<string> GetAvailableLanguages()
    {
        return _translations.Select(t => t.LanguageCode).ToList().AsReadOnly();
    }

    /// <summary>
    /// Checks if a translation exists for the specified language.
    /// </summary>
    /// <param name="languageCode">The language code to check.</param>
    /// <returns>True if a translation exists, otherwise false.</returns>
    public bool HasTranslation(string languageCode)
    {
        return Find(languageCode) != null;
    }

    /// <summary>
    /// Gets the count of translations.
    /// </summary>
    public int Count => _translations.Count;
}
