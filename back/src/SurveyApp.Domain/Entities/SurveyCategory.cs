using SurveyApp.Domain.Common;

namespace SurveyApp.Domain.Entities;

/// <summary>
/// Represents a category for organizing surveys.
/// All localizable content (Name, Description) is stored in the Translations collection.
/// </summary>
public class SurveyCategory : AggregateRoot<Guid>, ILocalizable<SurveyCategoryTranslation>
{
    private readonly List<SurveyCategoryTranslation> _translations = [];
    private readonly List<Survey> _surveys = [];

    /// <summary>
    /// Gets the namespace ID this category belongs to.
    /// </summary>
    public Guid NamespaceId { get; private set; }

    #region Localized Content Properties (resolved from default translation)

    /// <summary>
    /// Gets the name of the category from the default translation.
    /// </summary>
    public string Name => GetDefaultTranslation()?.Name ?? string.Empty;

    /// <summary>
    /// Gets the description of the category from the default translation.
    /// </summary>
    public string? Description => GetDefaultTranslation()?.Description;

    #endregion

    /// <summary>
    /// Gets the default language code for this category (ISO 639-1).
    /// </summary>
    public string DefaultLanguage { get; private set; } = "en";

    /// <summary>
    /// Gets the translations for this category.
    /// </summary>
    public IReadOnlyCollection<SurveyCategoryTranslation> Translations =>
        _translations.AsReadOnly();

    /// <summary>
    /// Gets the color associated with this category (hex format, e.g., "#3B82F6").
    /// Used for visual identification in the UI.
    /// </summary>
    public string? Color { get; private set; }

    /// <summary>
    /// Gets the icon identifier for this category.
    /// Can be a name from an icon library (e.g., "folder", "star", "chart").
    /// </summary>
    public string? Icon { get; private set; }

    /// <summary>
    /// Gets the display order of this category within the namespace.
    /// Lower values appear first.
    /// </summary>
    public int DisplayOrder { get; private set; }

    /// <summary>
    /// Gets whether this is the default category for new surveys.
    /// </summary>
    public bool IsDefault { get; private set; }

    /// <summary>
    /// Gets the surveys in this category.
    /// </summary>
    public IReadOnlyCollection<Survey> Surveys => _surveys.AsReadOnly();

    /// <summary>
    /// Gets the namespace navigation property.
    /// </summary>
    public Namespace Namespace { get; private set; } = null!;

    private SurveyCategory() { }

    private SurveyCategory(Guid id, Guid namespaceId, Guid createdBy)
        : base(id)
    {
        NamespaceId = namespaceId;
        CreatedBy = createdBy;
        DisplayOrder = 0;
        IsDefault = false;
    }

    /// <summary>
    /// Creates a new survey category with a default translation.
    /// </summary>
    /// <param name="namespaceId">The namespace ID.</param>
    /// <param name="name">The category name.</param>
    /// <param name="createdBy">The user who created the category.</param>
    /// <param name="languageCode">The default language code (ISO 639-1). Defaults to "en".</param>
    /// <param name="description">Optional description.</param>
    /// <param name="color">Optional color (hex format).</param>
    /// <param name="icon">Optional icon identifier.</param>
    public static SurveyCategory Create(
        Guid namespaceId,
        string name,
        Guid createdBy,
        string languageCode = "en",
        string? description = null,
        string? color = null,
        string? icon = null
    )
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new DomainException("Domain.Category.NameRequired");

        var category = new SurveyCategory(Guid.NewGuid(), namespaceId, createdBy)
        {
            DefaultLanguage = languageCode.ToLowerInvariant(),
            Color = color,
            Icon = icon,
        };

        // Create the default translation
        category.AddOrUpdateTranslation(languageCode, name, description);

        return category;
    }

    /// <summary>
    /// Updates the category name in the specified language (or default language).
    /// </summary>
    public void UpdateName(string name, string? languageCode = null)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new DomainException("Domain.Category.NameRequired");

        var lang = languageCode ?? DefaultLanguage;
        var translation = GetTranslation(lang);

        if (translation == null)
        {
            AddOrUpdateTranslation(lang, name);
        }
        else
        {
            translation.Update(name, translation.Description);
        }
    }

    /// <summary>
    /// Updates the category description in the specified language (or default language).
    /// </summary>
    public void UpdateDescription(string? description, string? languageCode = null)
    {
        var lang = languageCode ?? DefaultLanguage;
        var translation = GetTranslation(lang);

        translation?.Update(translation.Name, description);
    }

    /// <summary>
    /// Updates the category details (name and description) in the specified language.
    /// </summary>
    public void UpdateDetails(string name, string? description, string? languageCode = null)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new DomainException("Domain.Category.NameRequired");

        var lang = languageCode ?? DefaultLanguage;
        var translation = GetTranslation(lang);

        if (translation == null)
        {
            AddOrUpdateTranslation(lang, name, description);
        }
        else
        {
            translation.Update(name, description);
        }
    }

    /// <summary>
    /// Sets the category color.
    /// </summary>
    /// <param name="color">The color in hex format (e.g., "#3B82F6"). Pass null to clear.</param>
    public void SetColor(string? color)
    {
        if (color != null && !IsValidHexColor(color))
            throw new DomainException("Domain.Category.InvalidColorFormat");

        Color = color;
    }

    /// <summary>
    /// Sets the category icon.
    /// </summary>
    /// <param name="icon">The icon identifier. Pass null to clear.</param>
    public void SetIcon(string? icon)
    {
        Icon = icon;
    }

    /// <summary>
    /// Sets the display order.
    /// </summary>
    /// <param name="order">The display order (0 or greater).</param>
    public void SetDisplayOrder(int order)
    {
        if (order < 0)
            throw new DomainException("Domain.Category.InvalidDisplayOrder");

        DisplayOrder = order;
    }

    /// <summary>
    /// Sets this category as the default.
    /// </summary>
    public void SetAsDefault()
    {
        IsDefault = true;
    }

    /// <summary>
    /// Removes the default status from this category.
    /// </summary>
    public void ClearDefault()
    {
        IsDefault = false;
    }

    #region Translation Management

    // TranslationManager handles common translation operations
    private TranslationManager<SurveyCategoryTranslation>? _translationManager;

    private TranslationManager<SurveyCategoryTranslation> TranslationHelper =>
        _translationManager ??= new TranslationManager<SurveyCategoryTranslation>(
            _translations,
            lang => DefaultLanguage = lang
        );

    /// <summary>
    /// Adds or updates a translation for this category.
    /// </summary>
    public SurveyCategoryTranslation AddOrUpdateTranslation(
        string languageCode,
        string name,
        string? description = null
    )
    {
        var existingTranslation = GetTranslation(languageCode);

        if (existingTranslation != null)
        {
            existingTranslation.Update(name, description);
            return existingTranslation;
        }

        var isDefault = TranslationHelper.Count == 0;
        var translation = SurveyCategoryTranslation.Create(
            Id,
            languageCode,
            name,
            description,
            isDefault
        );

        _translations.Add(translation);

        if (isDefault)
        {
            DefaultLanguage = languageCode.ToLowerInvariant();
        }

        return translation;
    }

    /// <summary>
    /// Removes a translation from this category.
    /// </summary>
    public void RemoveTranslation(string languageCode) => TranslationHelper.Remove(languageCode);

    /// <summary>
    /// Gets a translation for the specified language, falling back to default if not found.
    /// </summary>
    public SurveyCategoryTranslation? GetTranslation(string? languageCode) =>
        TranslationHelper.Get(languageCode);

    /// <summary>
    /// Gets the default translation for this category.
    /// </summary>
    public SurveyCategoryTranslation? GetDefaultTranslation() => TranslationHelper.GetDefault();

    /// <summary>
    /// Gets the localized name for the specified language.
    /// </summary>
    public string GetLocalizedName(string? languageCode = null) =>
        GetTranslation(languageCode)?.Name ?? string.Empty;

    /// <summary>
    /// Gets the localized description for the specified language.
    /// </summary>
    public string? GetLocalizedDescription(string? languageCode = null) =>
        GetTranslation(languageCode)?.Description;

    /// <summary>
    /// Sets a translation as the default.
    /// </summary>
    public void SetDefaultTranslation(string languageCode) =>
        TranslationHelper.SetDefault(languageCode);

    /// <summary>
    /// Gets all available language codes for this category.
    /// </summary>
    public IReadOnlyList<string> GetAvailableLanguages() =>
        TranslationHelper.GetAvailableLanguages();

    #endregion

    #region Private Helpers

    private static bool IsValidHexColor(string color)
    {
        if (string.IsNullOrWhiteSpace(color))
            return false;

        // Match #RGB, #RRGGBB, or #RRGGBBAA formats
        return System.Text.RegularExpressions.Regex.IsMatch(
            color,
            @"^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$"
        );
    }

    #endregion
}
