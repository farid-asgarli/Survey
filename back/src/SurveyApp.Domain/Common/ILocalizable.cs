namespace SurveyApp.Domain.Common;

/// <summary>
/// Interface for entities that support multi-language translations.
/// </summary>
/// <typeparam name="TTranslation">The type of translation entity.</typeparam>
public interface ILocalizable<TTranslation>
    where TTranslation : Translation
{
    /// <summary>
    /// Gets the default language code (ISO 639-1) for this entity.
    /// </summary>
    string DefaultLanguage { get; }

    /// <summary>
    /// Gets the collection of translations for this entity.
    /// </summary>
    IReadOnlyCollection<TTranslation> Translations { get; }
}
