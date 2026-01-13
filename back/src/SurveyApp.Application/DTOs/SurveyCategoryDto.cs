namespace SurveyApp.Application.DTOs;

/// <summary>
/// DTO for survey category data.
/// </summary>
public class SurveyCategoryDto
{
    public Guid Id { get; set; }
    public Guid NamespaceId { get; set; }
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public string? Color { get; set; }
    public string? Icon { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsDefault { get; set; }
    public int SurveyCount { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    // Localization metadata
    public string DefaultLanguage { get; set; } = "en";
    public string Language { get; set; } = "en";
    public IReadOnlyList<string> AvailableLanguages { get; set; } = [];
}

/// <summary>
/// DTO for survey category list item (summary).
/// </summary>
public class SurveyCategorySummaryDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public string? Color { get; set; }
    public string? Icon { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsDefault { get; set; }
    public int SurveyCount { get; set; }
    public DateTime CreatedAt { get; set; }
}

/// <summary>
/// DTO for creating a survey category.
/// </summary>
public class CreateSurveyCategoryDto
{
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public string? Color { get; set; }
    public string? Icon { get; set; }
}

/// <summary>
/// DTO for updating a survey category.
/// </summary>
public class UpdateSurveyCategoryDto
{
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public string? Color { get; set; }
    public string? Icon { get; set; }
    public int? DisplayOrder { get; set; }
}

/// <summary>
/// DTO for reordering categories.
/// </summary>
public class ReorderCategoriesDto
{
    /// <summary>
    /// The ordered list of category IDs representing the new order.
    /// </summary>
    public List<Guid> CategoryIds { get; set; } = [];
}

/// <summary>
/// DTO for a category option (used in dropdowns).
/// </summary>
public class CategoryOptionDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = null!;
    public string? Color { get; set; }
    public string? Icon { get; set; }
    public bool IsDefault { get; set; }
}
