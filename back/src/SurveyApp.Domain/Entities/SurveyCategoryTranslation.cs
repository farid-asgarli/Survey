using SurveyApp.Domain.Common;

namespace SurveyApp.Domain.Entities;

/// <summary>
/// Represents a translation for a SurveyCategory entity.
/// </summary>
public class SurveyCategoryTranslation : Translation
{
    /// <summary>
    /// Gets the ID of the survey category this translation belongs to.
    /// </summary>
    public Guid CategoryId { get; private set; }

    /// <summary>
    /// Gets the translated name of the category.
    /// </summary>
    public string Name { get; private set; } = null!;

    /// <summary>
    /// Gets the translated description of the category.
    /// </summary>
    public string? Description { get; private set; }

    /// <summary>
    /// Navigation property to the parent category.
    /// </summary>
    public SurveyCategory Category { get; private set; } = null!;

    private SurveyCategoryTranslation() { }

    private SurveyCategoryTranslation(
        Guid id,
        Guid categoryId,
        string languageCode,
        string name,
        string? description,
        bool isDefault
    )
        : base(id, languageCode, isDefault)
    {
        CategoryId = categoryId;
        Name = name;
        Description = description;
    }

    /// <summary>
    /// Creates a new survey category translation.
    /// </summary>
    public static SurveyCategoryTranslation Create(
        Guid categoryId,
        string languageCode,
        string name,
        string? description = null,
        bool isDefault = false
    )
    {
        if (string.IsNullOrWhiteSpace(languageCode))
            throw new DomainException("Domain.SurveyCategoryTranslation.LanguageCodeRequired");

        if (string.IsNullOrWhiteSpace(name))
            throw new DomainException("Domain.SurveyCategoryTranslation.NameRequired");

        return new SurveyCategoryTranslation(
            Guid.NewGuid(),
            categoryId,
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
            throw new DomainException("Domain.SurveyCategoryTranslation.NameRequired");

        Name = name.Trim();
        Description = description?.Trim();
        MarkAsModified(userId);
    }
}
