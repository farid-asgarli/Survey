using SurveyApp.Domain.Common;

namespace SurveyApp.Domain.Entities;

/// <summary>
/// Represents a translation for a SurveyTheme entity.
/// </summary>
public class SurveyThemeTranslation : Translation
{
    /// <summary>
    /// Gets the ID of the survey theme this translation belongs to.
    /// </summary>
    public Guid ThemeId { get; private set; }

    /// <summary>
    /// Gets the translated name of the theme.
    /// </summary>
    public string Name { get; private set; } = null!;

    /// <summary>
    /// Gets the translated description of the theme.
    /// </summary>
    public string? Description { get; private set; }

    /// <summary>
    /// Navigation property to the parent theme.
    /// </summary>
    public SurveyTheme Theme { get; private set; } = null!;

    private SurveyThemeTranslation() { }

    private SurveyThemeTranslation(
        Guid id,
        Guid themeId,
        string languageCode,
        string name,
        string? description,
        bool isDefault
    )
        : base(id, languageCode, isDefault)
    {
        ThemeId = themeId;
        Name = name;
        Description = description;
    }

    /// <summary>
    /// Creates a new survey theme translation.
    /// </summary>
    public static SurveyThemeTranslation Create(
        Guid themeId,
        string languageCode,
        string name,
        string? description = null,
        bool isDefault = false
    )
    {
        if (string.IsNullOrWhiteSpace(languageCode))
            throw new ArgumentException("Language code is required.", nameof(languageCode));

        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Name is required.", nameof(name));

        return new SurveyThemeTranslation(
            Guid.NewGuid(),
            themeId,
            languageCode.ToLowerInvariant(),
            name.Trim(),
            description?.Trim(),
            isDefault
        );
    }

    /// <summary>
    /// Updates the translation content.
    /// </summary>
    public void Update(string name, string? description, Guid? userId = null)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Name is required.", nameof(name));

        Name = name.Trim();
        Description = description?.Trim();
        MarkAsModified(userId);
    }
}
