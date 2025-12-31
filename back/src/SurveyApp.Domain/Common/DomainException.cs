namespace SurveyApp.Domain.Common;

/// <summary>
/// Base exception for domain rule violations with localization support.
/// </summary>
public class DomainException : Exception
{
    /// <summary>
    /// Gets the resource key for localization.
    /// </summary>
    public string ResourceKey { get; }

    /// <summary>
    /// Gets the format arguments for the localized message.
    /// </summary>
    public object?[]? FormatArgs { get; }

    /// <summary>
    /// Creates a new domain exception with a resource key.
    /// </summary>
    /// <param name="resourceKey">The resource key for localization (e.g., "Domain.Survey.TitleRequired").</param>
    /// <param name="formatArgs">Optional format arguments for the localized message.</param>
    public DomainException(string resourceKey, params object?[]? formatArgs)
        : base(resourceKey) // Fallback to key if localization fails
    {
        ResourceKey = resourceKey;
        FormatArgs = formatArgs;
    }

    /// <summary>
    /// Creates a new domain exception with a resource key and an inner exception.
    /// </summary>
    public DomainException(
        string resourceKey,
        Exception innerException,
        params object?[]? formatArgs
    )
        : base(resourceKey, innerException)
    {
        ResourceKey = resourceKey;
        FormatArgs = formatArgs;
    }
}
