using System.Collections.Concurrent;
using System.Globalization;
using System.Text.Json;
using Microsoft.Extensions.Localization;

namespace SurveyApp.API.Localization;

/// <summary>
/// JSON-based string localizer that reads translations from JSON resource files.
/// </summary>
public class JsonStringLocalizer(string resourcesPath, ILogger<JsonStringLocalizer> logger)
    : IStringLocalizer
{
    private readonly ConcurrentDictionary<string, Dictionary<string, string>> _resourcesCache =
        new();
    private readonly string _resourcesPath = resourcesPath;
    private readonly ILogger<JsonStringLocalizer> _logger = logger;

    public LocalizedString this[string name]
    {
        get
        {
            var value = GetString(name);
            return new LocalizedString(name, value ?? name, value == null);
        }
    }

    public LocalizedString this[string name, params object[] arguments]
    {
        get
        {
            var format = GetString(name);
            var value = format != null ? string.Format(format, arguments) : name;
            return new LocalizedString(name, value, format == null);
        }
    }

    public IEnumerable<LocalizedString> GetAllStrings(bool includeParentCultures)
    {
        var culture = CultureInfo.CurrentUICulture.TwoLetterISOLanguageName;
        var resources = GetResources(culture);

        foreach (var resource in resources)
        {
            yield return new LocalizedString(resource.Key, resource.Value, false);
        }
    }

    private string? GetString(string name)
    {
        var culture = CultureInfo.CurrentUICulture.TwoLetterISOLanguageName;
        var resources = GetResources(culture);

        if (resources.TryGetValue(name, out var value))
        {
            return value;
        }

        // Fallback to English if key not found
        if (culture != "en")
        {
            var fallbackResources = GetResources("en");
            if (fallbackResources.TryGetValue(name, out var fallbackValue))
            {
                return fallbackValue;
            }
        }

        return null;
    }

    private Dictionary<string, string> GetResources(string culture)
    {
        return _resourcesCache.GetOrAdd(culture, LoadResources);
    }

    private Dictionary<string, string> LoadResources(string culture)
    {
        var filePath = Path.Combine(_resourcesPath, $"{culture}.json");

        if (!File.Exists(filePath))
        {
            _logger.LogWarning("Localization file not found: {FilePath}", filePath);
            return [];
        }

        try
        {
            var json = File.ReadAllText(filePath);
            var resources = JsonSerializer.Deserialize<Dictionary<string, string>>(json);
            return resources ?? [];
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error loading localization file: {FilePath}", filePath);
            return [];
        }
    }
}
