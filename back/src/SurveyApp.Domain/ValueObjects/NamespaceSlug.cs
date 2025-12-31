using System.Text.RegularExpressions;
using SurveyApp.Domain.Common;

namespace SurveyApp.Domain.ValueObjects;

/// <summary>
/// Represents a namespace slug value object with validation.
/// </summary>
public sealed partial class NamespaceSlug : ValueObject
{
    /// <summary>
    /// Maximum length for a slug.
    /// </summary>
    public const int MaxLength = 100;

    /// <summary>
    /// Minimum length for a slug.
    /// </summary>
    public const int MinLength = 2;

    /// <summary>
    /// Gets the slug value.
    /// </summary>
    public string Value { get; }

    private NamespaceSlug(string value)
    {
        Value = value;
    }

    /// <summary>
    /// Creates a new namespace slug value object.
    /// </summary>
    /// <param name="slug">The slug string.</param>
    /// <returns>A new NamespaceSlug value object.</returns>
    /// <exception cref="ArgumentException">Thrown when the slug is invalid.</exception>
    public static NamespaceSlug Create(string slug)
    {
        if (string.IsNullOrWhiteSpace(slug))
            throw new ArgumentException(
                "Domain.ValueObjects.NamespaceSlug.SlugEmpty",
                nameof(slug)
            );

        slug = NormalizeSlug(slug);

        if (slug.Length < MinLength)
            throw new ArgumentException(
                $"Slug must be at least {MinLength} characters.",
                nameof(slug)
            );

        if (slug.Length > MaxLength)
            throw new ArgumentException(
                $"Slug cannot exceed {MaxLength} characters.",
                nameof(slug)
            );

        if (!SlugRegex().IsMatch(slug))
            throw new ArgumentException(
                "Slug can only contain lowercase letters, numbers, and hyphens.",
                nameof(slug)
            );

        return new NamespaceSlug(slug);
    }

    /// <summary>
    /// Creates a slug from a name by converting it to a URL-friendly format.
    /// </summary>
    /// <param name="name">The name to convert to a slug.</param>
    /// <returns>A new NamespaceSlug value object.</returns>
    public static NamespaceSlug CreateFromName(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException(
                "Domain.ValueObjects.NamespaceSlug.NameEmpty",
                nameof(name)
            );

        var slug = NormalizeSlug(name);
        return Create(slug);
    }

    /// <summary>
    /// Tries to create a new namespace slug value object.
    /// </summary>
    /// <param name="slug">The slug string.</param>
    /// <param name="result">The created NamespaceSlug value object if successful.</param>
    /// <returns>True if the slug is valid, false otherwise.</returns>
    public static bool TryCreate(string? slug, out NamespaceSlug? result)
    {
        result = null;

        if (string.IsNullOrWhiteSpace(slug))
            return false;

        slug = NormalizeSlug(slug);

        if (slug.Length < MinLength || slug.Length > MaxLength)
            return false;

        if (!SlugRegex().IsMatch(slug))
            return false;

        result = new NamespaceSlug(slug);
        return true;
    }

    private static string NormalizeSlug(string input)
    {
        // Convert to lowercase
        var slug = input.ToLowerInvariant();

        // Replace spaces and underscores with hyphens
        slug = UnderscoreRegex().Replace(slug, "-");

        // Remove invalid characters
        slug = InvalidCharRegex().Replace(slug, "");

        // Remove multiple consecutive hyphens
        slug = HyphenRegex().Replace(slug, "-");

        // Trim hyphens from start and end
        slug = slug.Trim('-');

        return slug;
    }

    protected override IEnumerable<object?> GetEqualityComponents()
    {
        yield return Value;
    }

    public override string ToString() => Value;

    public static implicit operator string(NamespaceSlug slug) => slug.Value;

    [GeneratedRegex(@"^[a-z0-9]+(?:-[a-z0-9]+)*$", RegexOptions.Compiled)]
    private static partial Regex SlugRegex();

    [GeneratedRegex(@"[\s_]+")]
    private static partial Regex UnderscoreRegex();

    [GeneratedRegex(@"[^a-z0-9\-]")]
    private static partial Regex InvalidCharRegex();

    [GeneratedRegex(@"-+")]
    private static partial Regex HyphenRegex();
}
